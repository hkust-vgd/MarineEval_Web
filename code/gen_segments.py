import argparse
import os

import cv2
import numpy as np

content = {
    19: {
        "title": "Species Comprehension (SC)",
        "desc": "Examines the capability of VLMs to identify and interpret species-level visual information, thereby contributing to biodiversity monitoring and ecological research.",
    },
    13: {
        "title": "Marine Technology Understanding (MTU)",
        "desc": "Evaluates understanding of marine technologies, which constitute a critical component of marine research.",
    },
    10: {
        "title": "Spatial Reasoning (SR)",
        "desc": "Measures spatial comprehension ability. While it is commonly evaluated in general scenarios, MarineEval specifically investigates whether VLMs sustain high performance in marine environments.",
    },
    9: {
        "title": "Conservation & Threat Analysis (C&TA)",
        "desc": "Emphasizes the ability of VLMs to accurately interpret domain-specific content, particularly in the context of endangered species and disaster classification.",
    },
    14: {
        "title": "Document Interpretation (DI)",
        "desc": "Evaluates the capacity of VLMs to analyze and derive insights from scientific literature and documentary sources. This functionality is especially critical for enhancing scientific understanding and generating insightful ecological reports.",
    },
    15: {
        "title": "Hallucination Resistance (HR)",
        "desc": "Tests the robustness of VLMs in avoiding erroneous or hallucinatory outputs. Specifically, it involves pairing generally true statements with images that depict corner cases or counterexamples to assess whether the VLM is susceptible to being misled by the accompanying statements.",
    },
    18: {
        "title": "Behavior & Trait Extraction (B&TE)",
        "desc": "Focuses on the ability to derive meaningful insights into the behavior and physical traits of marine organisms, facilitating advancements in automated observational and documentary records.",
    },
    27: {
        "title": "Species Identification",
        "desc": "Determine the scientific (binomial) name of a species from a single specimen image.",
    },
    26: {
        "title": "Cross-Image Matching",
        "desc": "Assess whether two independently presented images depict the same species.",
    },
    25: {
        "title": "Biodiversity Recognition",
        "desc": "Identify and list all distinct species visible within a complex ecological scene.",
    },
    23: {
        "title": "Ecological Attribute Inference",
        "desc": "Infer ecological attributes of a given species, such as habitat, geographic range, or trophic role, from its image.",
    },
    21: {
        "title": "Inter-Species Relationship Reasoning",
        "desc": "Analyze pairs of species images to deduce their ecological relationship (e.g., predation, mutualism, symbiosis).",
    },
    17: {
        "title": "Camouflage Localization",
        "desc": "Detect and spatially delineate organisms exhibiting camouflage through disruptive coloration or texture blending.",
    },
    12: {
        "title": "Instrument Function Identification",
        "desc": "Identify the function or operational role of marine equipment shown in an image.",
    },
    7: {
        "title": "Visual Grounding",
        "desc": "Locate within an image the species or object referenced in a textual query.",
    },
    5: {
        "title": "Numerosity Estimation",
        "desc": "Count the number of instances of relevant entities (e.g., fish, vessels) present in an image.",
    },
    3: {
        "title": "Depth Ordering",
        "desc": "Determine which of several designated points in an image is closest to the observer or camera viewpoint.",
    },
    1: {
        "title": "Spatial Relation Assessment",
        "desc": "Infer the relative spatial arrangement between two organisms (e.g., left of, above).",
    },
    2: {
        "title": "Disaster Diagnosis",
        "desc": "Identify the type of environmental disaster represented in an image.",
    },
    4: {
        "title": "Pollutant Localization",
        "desc": "Detect and localize anthropogenic pollutants or contaminants within the visual scene.",
    },
    6: {
        "title": "Threat-Status Determination",
        "desc": "Determine the International Union for Conservation of Nature (IUCN) conservation status of the focal organism.",
    },
    8: {
        "title": "Figure Understanding",
        "desc": "Interpret and derive insights from scientific figures or graphical data representations.",
    },
    11: {
        "title": "Book Understanding",
        "desc": "Comprehend and extract information from book pages.",
    },
    16: {
        "title": "Paper Understanding",
        "desc": "Analyze, and interpret research findings presented in scientific journal articles with extensive textual content.",
    },
    20: {
        "title": "Hallucination Resistance",
        "desc": "Assess whether the model produces fabricated or unsupported outputs when prompted with ambiguous or controlled inputs.",
    },
    22: {
        "title": "Traits Extraction",
        "desc": " Extract key morphological or visual traits of a species from a single image.",
    },
    24: {
        "title": "Behavioural Classification",
        "desc": "Identify and classify behavioral patterns displayed in a short sequence of frames.",
    },
}


def contour_to_svg_bezier(cnt, idx, width, height, step=1):
    """
    Convert contour points to smooth quadratic Bezier path.
    - step: how many points to skip between curve segments (larger = smoother & smaller SVG)
    """
    cnt = cnt.squeeze()
    if len(cnt.shape) < 2:
        return

    # Downsample contour for fewer, smoother control points
    pts = cnt[::step]
    if len(pts) < 3:
        return None

    d = f"M{pts[0][0]:.1f},{pts[0][1]:.1f} "
    for i in range(1, len(pts) - 1):
        # Middle point as control, next point as end
        cx, cy = pts[i]
        ex, ey = pts[i + 1]
        d += f"Q{cx:.1f},{cy:.1f} {ex:.1f},{ey:.1f} "
    d += "Z"
    return d


def contour_to_svg(cnt, idx, width, height):
    """Convert one contour to standalone SVG file."""
    cnt = cnt.squeeze()

    if len(cnt.shape) < 2:
        return

    # Create SVG path command (M = move, L = line, Z = close)
    d = f"M{cnt[0][0]} {cnt[0][1]} "
    for x, y in cnt[1:]:
        d += f"L{x} {y} "
    d += "Z"
    return d
    # svg_content = f"""<svg
    #     version="1.2"
    #     xmlns="http://www.w3.org/2000/svg"
    #     viewBox="0 0 {width} {height}"
    #     width="{width}"
    #     height="{height}"
    #     class="mask-overlay"
    # >
    #     <path class="mask" data-tooltip="Segment {idx}" d="{d}" />
    # </svg>
    # """

    # return svg_content


def main(args):
    image_path = args.image_path
    output_path = args.output_path

    image = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)

    if image.shape[2] == 4:
        alpha = image[:, :, 3]
    else:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        alpha = gray

    _, mask = cv2.threshold(alpha, 1, 255, cv2.THRESH_BINARY)

    inverted = cv2.bitwise_not(mask)

    kernal = np.ones((3, 3), np.uint8)
    lines = cv2.dilate(inverted, kernal, iterations=1)

    # Separate the segments (subtract black lines from filled content)
    separated = cv2.bitwise_and(mask, mask, mask=cv2.bitwise_not(lines))

    # Find connected contours (each one = 1 segment)
    contours, _ = cv2.findContours(
        separated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    height, width = separated.shape
    svg_content = f"""<svg
        version="1.2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 {width} {height}"
        width="{width}"
        height="{height}"
        class="mask-overlay"
    >
    """

    for i, cnt in enumerate(contours):
        d = contour_to_svg(cnt, i + 1, width, height)
        title = content.get(i + 1, {}).get("title", f"Segment {i + 1}")
        desc = content.get(i + 1, {}).get("desc", f"Segment {i + 1}")
        svg_content += f'    <path class="mask" data-title="{title}" data-desc="{desc}" d="{d}" />\n'

    svg_content += "</svg>"

    with open(output_path, "w") as f:
        f.write(svg_content)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--image_path",
        type=str,
        required=True,
        help="Path to the input RGBA mask image.",
    )
    parser.add_argument(
        "--output_path",
        type=str,
        default="./output.txt",
        help="Path to save the output binary mask image.",
    )
    args = parser.parse_args()
    main(args)
