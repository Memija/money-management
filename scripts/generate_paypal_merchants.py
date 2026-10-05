import os
from PIL import Image, ImageDraw, ImageFont

def get_font(name, size):
    font_paths = [
        f"C:/Windows/Fonts/{name}",
        f"C:/Windows/Fonts/{name.lower()}",
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/arial.ttf"
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def create_rounded_mask(size, radius):
    mask = Image.new('L', size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([(0, 0), (size[0]-1, size[1]-1)], radius=radius, fill=255)
    return mask

def make_etoro(out_path):
    S = 1024
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background gradient: dark rich emerald
    for y in range(S):
        factor = y / S
        r = int(12 * (1 - factor) + 6 * factor)
        g = int(38 * (1 - factor) + 22 * factor)
        b = int(26 * (1 - factor) + 16 * factor)
        draw.line([(0, y), (S, y)], fill=(r, g, b, 255))
        
    # Draw eToro Bull Horns + Head symbol
    # Center around (512, 390)
    cx, cy = 512, 380
    green = (19, 193, 102, 255) # eToro vibrant green #13C166
    white = (255, 255, 255, 255)
    
    # Outer horns: elegant curving horns
    # Left horn
    draw.polygon([
        (cx - 40, cy + 20),
        (cx - 110, cy - 40),
        (cx - 200, cy - 160),
        (cx - 220, cy - 250),
        (cx - 180, cy - 240),
        (cx - 130, cy - 130),
        (cx - 60, cy - 30),
        (cx - 20, cy + 10)
    ], fill=green)
    
    # Right horn
    draw.polygon([
        (cx + 40, cy + 20),
        (cx + 110, cy - 40),
        (cx + 200, cy - 160),
        (cx + 220, cy - 250),
        (cx + 180, cy - 240),
        (cx + 130, cy - 130),
        (cx + 60, cy - 30),
        (cx + 20, cy + 10)
    ], fill=green)
    
    # Center head circle
    draw.ellipse([(cx - 95, cy - 70), (cx + 95, cy + 120)], fill=green)
    # Inner dark cutout to give bull/head form
    draw.ellipse([(cx - 55, cy - 30), (cx + 55, cy + 80)], fill=(10, 30, 20, 255))
    draw.ellipse([(cx - 35, cy - 10), (cx + 35, cy + 60)], fill=green)
    
    # eToro Wordmark
    font = get_font("segoeuib.ttf", 160)
    text = "eToro"
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0]
    draw.text((cx - tw // 2, 700), text, fill=white, font=font)
    
    # Subtitle: INVEST & TRADE
    sub_font = get_font("segoeuib.ttf", 46)
    sub_text = "INVEST & TRADE"
    sbbox = sub_font.getbbox(sub_text)
    sw = sbbox[2] - sbbox[0]
    draw.text((cx - sw // 2, 880), sub_text, fill=green, font=sub_font)
    
    # Downsample
    mask = create_rounded_mask((S, S), 144)
    img.putalpha(mask)
    res = img.resize((256, 256), Image.Resampling.LANCZOS)
    res.save(out_path, 'PNG')
    print(f"Saved {out_path}")

def make_xsolla(out_path):
    S = 1024
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Dark carbon background
    for y in range(S):
        v = int(18 + 10 * (y / S))
        draw.line([(0, y), (S, y)], fill=(v, v, v + 2, 255))
        
    cx, cy = 512, 410
    red = (255, 0, 54, 255) # Xsolla red #FF0036
    white = (255, 255, 255, 255)
    
    # Stylized dynamic 'X'
    # Diagonal 1: top-left to bottom-right (Red)
    w = 75
    draw.polygon([
        (cx - 240, cy - 230),
        (cx - 240 + w, cy - 230),
        (cx + 240, cy + 210),
        (cx + 240 - w, cy + 210)
    ], fill=red)
    
    # Diagonal 2: top-right to bottom-left (White & Red segmented)
    draw.polygon([
        (cx + 240, cy - 230),
        (cx + 240 - w, cy - 230),
        (cx + 20, cy - 30),
        (cx + 75, cy + 20)
    ], fill=white)
    
    draw.polygon([
        (cx - 20, cy + 30),
        (cx - 75, cy - 20),
        (cx - 240, cy + 210),
        (cx - 240 + w, cy + 210)
    ], fill=white)
    
    # Center accent dot / diamond
    draw.polygon([
        (cx, cy - 35),
        (cx + 40, cy),
        (cx, cy + 35),
        (cx - 40, cy)
    ], fill=red)
    
    # Wordmark: XSOLLA
    font = get_font("segoeuib.ttf", 150)
    text = "XSOLLA"
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0]
    draw.text((cx - tw // 2, 730), text, fill=white, font=font)
    
    # Subtitle
    sub_font = get_font("segoeuib.ttf", 46)
    sub_text = "VIDEO GAME COMMERCE"
    sbbox = sub_font.getbbox(sub_text)
    sw = sbbox[2] - sbbox[0]
    draw.text((cx - sw // 2, 895), sub_text, fill=red, font=sub_font)
    
    mask = create_rounded_mask((S, S), 144)
    img.putalpha(mask)
    res = img.resize((256, 256), Image.Resampling.LANCZOS)
    res.save(out_path, 'PNG')
    print(f"Saved {out_path}")

def make_avaaz(out_path):
    S = 1024
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Avaaz bold crimson gradient
    for y in range(S):
        factor = y / S
        r = int(236 * (1 - factor) + 195 * factor)
        g = int(28 * (1 - factor) + 16 * factor)
        b = int(36 * (1 - factor) + 24 * factor)
        draw.line([(0, y), (S, y)], fill=(r, g, b, 255))
        
    cx, cy = 512, 450
    white = (255, 255, 255, 255)
    
    # Speech wave / sound arc over wordmark
    draw.arc([(cx - 160, cy - 280), (cx + 160, cy - 40)], start=190, end=350, fill=white, width=28)
    draw.arc([(cx - 100, cy - 220), (cx + 100, cy - 70)], start=190, end=350, fill=white, width=22)
    draw.arc([(cx - 40, cy - 160), (cx + 40, cy - 100)], start=190, end=350, fill=white, width=16)
    
    # "avaaz" lowercase wordmark
    font = get_font("segoeuib.ttf", 230)
    text = "avaaz"
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0]
    draw.text((cx - tw // 2, cy - 60), text, fill=white, font=font)
    
    # Subtitle: THE WORLD IN ACTION
    sub_font = get_font("segoeuib.ttf", 46)
    sub_text = "THE WORLD IN ACTION"
    sbbox = sub_font.getbbox(sub_text)
    sw = sbbox[2] - sbbox[0]
    draw.text((cx - sw // 2, cy + 240), sub_text, fill=(255, 235, 235, 255), font=sub_font)
    
    mask = create_rounded_mask((S, S), 144)
    img.putalpha(mask)
    res = img.resize((256, 256), Image.Resampling.LANCZOS)
    res.save(out_path, 'PNG')
    print(f"Saved {out_path}")

def make_kalea(out_path):
    S = 1024
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Deep midnight navy
    for y in range(S):
        factor = y / S
        r = int(14 * (1 - factor) + 8 * factor)
        g = int(24 * (1 - factor) + 14 * factor)
        b = int(46 * (1 - factor) + 28 * factor)
        draw.line([(0, y), (S, y)], fill=(r, g, b, 255))
        
    cx, cy = 512, 512
    gold = (229, 169, 60, 255) # Kalea amber gold #E5A93C
    white = (255, 255, 255, 255)
    
    # Gold decorative frame border
    draw.rounded_rectangle([(70, 70), (S - 70, S - 70)], radius=90, outline=gold, width=8)
    draw.rounded_rectangle([(88, 88), (S - 88, S - 88)], radius=76, outline=(180, 130, 40, 180), width=3)
    
    # Hop cone / beer crown symbol
    # Center around (512, 310)
    hy = 310
    # Crown / Hop leaves
    draw.polygon([(cx, hy - 130), (cx + 45, hy - 40), (cx - 45, hy - 40)], fill=gold)
    draw.polygon([(cx - 70, hy - 70), (cx - 20, hy + 20), (cx - 95, hy + 10)], fill=gold)
    draw.polygon([(cx + 70, hy - 70), (cx + 20, hy + 20), (cx + 95, hy + 10)], fill=gold)
    # Hop base scales
    draw.ellipse([(cx - 65, hy - 10), (cx + 65, hy + 85)], fill=gold)
    draw.ellipse([(cx - 45, hy + 20), (cx + 45, hy + 110)], fill=(245, 195, 80, 255))
    
    # Stars
    draw.text((cx - 160, hy - 20), "★", fill=gold, font=get_font("segoeuib.ttf", 60))
    draw.text((cx + 120, hy - 20), "★", fill=gold, font=get_font("segoeuib.ttf", 60))
    
    # "KALEA" wordmark
    font = get_font("arialbd.ttf", 170)
    text = "KALEA"
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0]
    draw.text((cx - tw // 2, 520), text, fill=gold, font=font)
    
    # Gold separator line
    draw.line([(cx - 220, 725), (cx + 220, 725)], fill=gold, width=5)
    draw.ellipse([(cx - 8, 721), (cx + 8, 729)], fill=white)
    
    # Subtitle: BEERTASTING CLUB
    sub_font = get_font("segoeuib.ttf", 46)
    sub_text = "BEERTASTING CLUB"
    sbbox = sub_font.getbbox(sub_text)
    sw = sbbox[2] - sbbox[0]
    draw.text((cx - sw // 2, 765), sub_text, fill=white, font=sub_font)
    
    # Salzburg Austria
    loc_font = get_font("segoeuib.ttf", 36)
    loc_text = "SALZBURG • AUSTRIA"
    lbbox = loc_font.getbbox(loc_text)
    lw = lbbox[2] - lbbox[0]
    draw.text((cx - lw // 2, 835), loc_text, fill=(200, 160, 90, 255), font=loc_font)
    
    mask = create_rounded_mask((S, S), 144)
    img.putalpha(mask)
    res = img.resize((256, 256), Image.Resampling.LANCZOS)
    res.save(out_path, 'PNG')
    print(f"Saved {out_path}")

def make_cyberport(out_path):
    S = 1024
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Cyberport cobalt blue gradient
    for y in range(S):
        factor = y / S
        r = int(0 * (1 - factor) + 4 * factor)
        g = int(79 * (1 - factor) + 45 * factor)
        b = int(158 * (1 - factor) + 115 * factor)
        draw.line([(0, y), (S, y)], fill=(r, g, b, 255))
        
    cx, cy = 512, 450
    cyan = (0, 194, 232, 255) # Cyberport tech cyan #00C2E8
    white = (255, 255, 255, 255)
    
    # Modern computer monitor / tech port badge above wordmark
    my = 290
    draw.rounded_rectangle([(cx - 140, my - 110), (cx + 140, my + 70)], radius=30, outline=white, width=18)
    draw.line([(cx - 40, my + 80), (cx + 40, my + 80)], fill=white, width=18)
    draw.line([(cx - 90, my + 130), (cx + 90, my + 130)], fill=white, width=18)
    draw.line([(cx, my + 80), (cx, my + 130)], fill=white, width=18)
    # Power / port symbol inside screen
    draw.ellipse([(cx - 45, my - 60), (cx + 45, my + 30)], outline=cyan, width=14)
    draw.line([(cx, my - 65), (cx, my - 15)], fill=cyan, width=14)
    
    # "CYBERPORT" bold wordmark
    font = get_font("segoeuib.ttf", 145)
    text = "CYBERPORT"
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0]
    draw.text((cx - tw // 2, 540), text, fill=white, font=font)
    
    # Cyan underline bar
    draw.rounded_rectangle([(cx - tw // 2, 705), (cx + tw // 2, 718)], radius=6, fill=cyan)
    
    # Subtitle: COMPUTER & ELECTRONICS
    sub_font = get_font("segoeuib.ttf", 46)
    sub_text = "TECH & ELECTRONICS"
    sbbox = sub_font.getbbox(sub_text)
    sw = sbbox[2] - sbbox[0]
    draw.text((cx - sw // 2, 765), sub_text, fill=(210, 235, 255, 255), font=sub_font)
    
    mask = create_rounded_mask((S, S), 144)
    img.putalpha(mask)
    res = img.resize((256, 256), Image.Resampling.LANCZOS)
    res.save(out_path, 'PNG')
    print(f"Saved {out_path}")

if __name__ == '__main__':
    out_dir = 'public/brands'
    os.makedirs(out_dir, exist_ok=True)
    make_etoro(os.path.join(out_dir, 'etoro.png'))
    make_xsolla(os.path.join(out_dir, 'xsolla.png'))
    make_avaaz(os.path.join(out_dir, 'avaaz.png'))
    make_kalea(os.path.join(out_dir, 'kalea.png'))
    make_cyberport(os.path.join(out_dir, 'cyberport.png'))
