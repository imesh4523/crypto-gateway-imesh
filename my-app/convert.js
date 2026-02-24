const fs = require('fs');

const html = fs.readFileSync('../index.html', 'utf-8');

const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);
if (!bodyMatch) {
    console.log("Could not find body");
    process.exit(1);
}

let body = bodyMatch[1];

// Remove script tag
body = body.replace(/<script[\s\S]*?<\/script>/g, '');

// Remove HTML comments
body = body.replace(/<!--[\s\S]*?-->/g, '');

// JSX fixes
body = body.split('class="').join('className="');
body = body.split('stroke-width=').join('strokeWidth=');
body = body.split('stroke-linecap=').join('strokeLinecap=');
body = body.split('stroke-linejoin=').join('strokeLinejoin=');
body = body.split('<br>').join('<br />');
body = body.split('style="width: 59%;"').join('style={{ width: "59%" }}');
body = body.split('style="width: 30%"').join('style={{ width: "30%" }}');
body = body.split('style="width: 20%"').join('style={{ width: "20%" }}');
body = body.split('style="height: 80%"').join('style={{ height: "80%" }}');

// Replace any remaining empty brackets that might cause issues, though `class=` replaced to `className=` handles most.

const pageTxt = `import Script from 'next/script';
import './soltio.css';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-[#05050f] text-white min-h-screen">
      <Script src="/script.js" strategy="afterInteractive" />
      ${body}
    </div>
  );
}`;

fs.writeFileSync('src/app/page.tsx', pageTxt.trim(), 'utf-8');
console.log("Successfully converted page.tsx");
