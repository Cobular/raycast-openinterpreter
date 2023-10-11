import urllib.parse

def svg_to_url(svg_path):
    with open(svg_path, 'r') as file:
        svg_data = file.read()
    
    encoded_svg_data = urllib.parse.quote(svg_data)
    url = f"https://icon.ray.so/?fileName=extension_icon&icon=undefined&backgroundRadius=128&backgroundStrokeSize=0&backgroundStrokeColor=%23FFFFFF&backgroundRadialGlare=false&backgroundNoiseTexture=false&backgroundNoiseTextureOpacity=25&backgroundStrokeOpacity=100&iconColor=%23FFFFFF&iconSize=352&selectedPresetIndex=9&customSvg={encoded_svg_data}&backgroundFillType=Linear&backgroundStartColor=%23DD1818&backgroundEndColor=%23380202&backgroundAngle=135"
    
    return url

# Provide the path to your SVG file here
svg_path = sys.argv[1]
url = svg_to_url(svg_path)
print(url)