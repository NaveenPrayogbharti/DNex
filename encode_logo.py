import base64
with open(r"c:\Users\Administrator\Desktop\DNex\frontend\src\assets\images\website_logo.png", "rb") as f:
    img_data = f.read()
b64 = base64.b64encode(img_data).decode("utf-8")
with open(r"c:\Users\Administrator\Desktop\DNex\frontend\src\app\crm\utils\logoBase64.ts", "w") as f:
    f.write(f'export const LOGO_BASE64 = "data:image/png;base64,{b64}";\n')
