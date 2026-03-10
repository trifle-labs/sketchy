import FormData from 'form-data';
import { buildWorkflow } from './workflow';
import { getComfyOrgToken } from './auth';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 300_000; // 5 minutes

function comfyUrl(path: string): string {
  const base = (process.env.COMFYUI_URL ?? 'http://localhost:8188').replace(/\/$/, '');
  return `${base}${path}`;
}

function authHeaders(): Record<string, string> {
  const key = process.env.COMFYUI_API_KEY;
  const comfyUser = process.env.COMFY_USER ?? '';
  return {
    ...(key ? { Authorization: `Bearer ${key}` } : {}),
    'Comfy-User': comfyUser,
  };
}

export async function uploadImage(buffer: Buffer, filename: string): Promise<string> {
  const form = new FormData();
  form.append('image', buffer, { filename, contentType: 'image/png' });

  const res = await fetch(comfyUrl('/upload/image'), {
    method: 'POST',
    headers: { ...authHeaders(), ...form.getHeaders() },
    body: form.getBuffer(),
  });

  if (!res.ok) {
    throw new Error(`ComfyUI upload failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json() as { name: string };
  return data.name;
}

export async function submitWorkflow(imageName: string): Promise<string> {
  const workflow = buildWorkflow(imageName);
  const comfyOrgToken = await getComfyOrgToken();

  const body: Record<string, unknown> = {
    prompt: workflow,
    extra_data: { auth_token_comfy_org: comfyOrgToken },
  };

  const res = await fetch(comfyUrl('/api/prompt'), {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`ComfyUI prompt failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json() as { prompt_id: string };
  return data.prompt_id;
}

export async function pollResult(promptId: string): Promise<string> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const res = await fetch(comfyUrl(`/history/${promptId}`), {
      headers: authHeaders(),
    });

    if (res.ok) {
      const history = await res.json() as Record<string, unknown>;
      type HistoryEntry = {
        outputs?: Record<string, { images?: { filename: string; type: string }[] }>;
        status?: { completed?: boolean; status_str?: string; messages?: [string, Record<string, unknown>][] };
      };
      const entry = history[promptId] as HistoryEntry | undefined;

      if (entry?.status?.status_str === 'error') {
        const errMsg = entry.status.messages?.find(m => m[0] === 'execution_error')?.[1]?.exception_message as string | undefined;
        throw new Error(`ComfyUI execution error: ${errMsg ?? 'unknown'}`);
      }

      if (entry?.outputs && Object.keys(entry.outputs).length > 0) {
        for (const nodeOutput of Object.values(entry.outputs)) {
          if (nodeOutput.images && nodeOutput.images.length > 0) {
            const img = nodeOutput.images.find(i => i.type === 'output');
            if (img) return img.filename;
          }
        }
      }
    }

    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error(`ComfyUI timed out after ${POLL_TIMEOUT_MS / 1000}s waiting for prompt ${promptId}`);
}

export async function downloadImage(filename: string): Promise<Buffer> {
  const url = comfyUrl(`/view?filename=${encodeURIComponent(filename)}&type=output`);
  const res = await fetch(url, { headers: authHeaders() });

  if (!res.ok) {
    throw new Error(`ComfyUI download failed: ${res.status} ${await res.text()}`);
  }

  return Buffer.from(await res.arrayBuffer());
}
