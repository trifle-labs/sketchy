export function buildWorkflow(uploadedImageName: string): object {
  return {
    "1": {
      "inputs": {
        "image": "Capture-2026-03-03-103147.png"
      },
      "class_type": "LoadImage",
      "_meta": {
        "title": "Image 1: ref1"
      }
    },
    "2": {
      "inputs": {
        "image": "Screenshot 2026-03-03 at 10.34.08.png"
      },
      "class_type": "LoadImage",
      "_meta": {
        "title": "Image 2: ref2"
      }
    },
    "3": {
      "inputs": {
        "image": uploadedImageName
      },
      "class_type": "LoadImage",
      "_meta": {
        "title": "Image 3: Avatar"
      }
    },
    "4": {
      "inputs": {
        "image1": ["1", 0],
        "image2": ["2", 0]
      },
      "class_type": "ImageBatch",
      "_meta": {
        "title": "Batch 1+2"
      }
    },
    "5": {
      "inputs": {
        "image1": ["4", 0],
        "image2": ["3", 0]
      },
      "class_type": "ImageBatch",
      "_meta": {
        "title": "Batch +3"
      }
    },
    "6": {
      "inputs": {
        "prompt": "Extreme macro product photograph of a translucent gashapon capsule ball under visible stress. Inside is a single toy figurine — a plastic replica of [USER AVATAR] — that is way too large for the capsule. The figurine is jammed in so tight the clear dome is bowing outward, hairline stress fractures spiderwebbing through the plastic from the pressure. The figure's face and body are deformed against the curved inner walls, features flattened and spread where they press into the dome like a face against a window. The colored bottom half of the capsule is slightly cracked, bulging at the seam where the two halves meet, looking like it could pop open any second. The figurine's limbs are folded and compressed into unnatural positions just to fit, knees to chest, arms pinned, every square millimeter of interior space occupied by this thing that should not be in there. A tiny crumpled cardboard insert is crushed paper-thin beneath the figure, completely illegible. The material finish and surface quality of the figurine — glossy, matte, metallic, gritty, smooth, neon, degraded — is determined entirely by [USER AVATAR]'s visual style, when the reference is photographic, the person inside looks JUST LIKE THE PHOTO. The color of the capsule shell, the tone of the plastic, the hue of the cracks, the color temperature of the lighting, the tint of the bokeh, the surface the capsule sits on — all of it is infected by the avatar's dominant palette and energy. If the avatar is blown-out and oversaturated, the capsule looks radioactive. If the avatar is dark and lo-fi, the whole scene looks like a cursed product listing on a dead auction site. The capsule is photographed like it's evidence — clinical lighting, shallow depth of field, uncomfortably close, the kind of detail where you can see air bubbles trapped in the plastic and micro-scratches on the dome. It should feel like this thing is one degree away from exploding.\n\n",
        "seed": Math.floor(Math.random() * 2_147_483_647),
        "quality": "low",
        "background": "auto",
        "size": "1024x1024",
        "n": 1,
        "model": "gpt-image-1.5",
        "image": ["5", 0]
      },
      "class_type": "OpenAIGPTImage1",
      "_meta": {
        "title": "GPT Image 1.5"
      }
    },
    "7": {
      "inputs": {
        "filename_prefix": "PachinkoCooker_GPT",
        "images": ["6", 0]
      },
      "class_type": "SaveImage",
      "_meta": {
        "title": "Save Image"
      }
    }
  };
}
