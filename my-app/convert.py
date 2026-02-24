import re

with open('../index.html', 'r', encoding='utf-8') as f:
    html = f.read()

body_match = re.search(r'<body>(.*?)</body>', html, re.DOTALL)
if not body_match:
    print("Could not find body")
    exit()

body = body_match.group(1)

# Remove script tag
body = re.sub(r'<script.*?</script>', '', body, flags=re.DOTALL)

# JSX fixes
body = body.replace('class="', 'className="')
body = body.replace('stroke-width=', 'strokeWidth=')
body = body.replace('stroke-linecap=', 'strokeLinecap=')
body = body.replace('stroke-linejoin=', 'strokeLinejoin=')
body = body.replace('<br>', '<br />')
body = body.replace('style="width: 59%;"', 'style={{ width: "59%" }}')
body = body.replace('style="width: 30%"', 'style={{ width: "30%" }}')
body = body.replace('style="width: 20%"', 'style={{ width: "20%" }}')
body = body.replace('style="height: 80%"', 'style={{ height: "80%" }}')

page_txt = f"""import Script from 'next/script';
import './soltio.css';
import Link from 'next/link';

export default function Home() {{
  return (
    <div className="bg-[#05050f] text-white min-h-screen">
      <Script src="/script.js" strategy="afterInteractive" />
      {body}
    </div>
  );
}}
"""

with open('src/app/page.tsx', 'w', encoding='utf-8') as f2:
    f2.write(page_txt.strip())

print("Successfully converted page.tsx")
