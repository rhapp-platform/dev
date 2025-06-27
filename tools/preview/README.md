# Preview Tool

A utility for generating static HTML preview pages, deploying them to Cloudflare R2, and sending notifications via ntfy.

## Features

- 🎨 Generate clean, responsive HTML preview pages
- 📤 Deploy to Cloudflare R2 using rclone
- 📱 Send notifications via ntfy with clickable links
- ⚡ Fast and lightweight with Bun/TypeScript

## Usage

### CLI Usage

```bash
# Basic usage with defaults
npm start

# Custom title and content
npm start "My Preview" "<h2>Custom content</h2><p>Hello world!</p>"

# Or build and run directly
npm run build
node dist/index.js "Test Page" "<p>Test content</p>"
```

### Programmatic Usage

```typescript
import { createPreview } from './src/index.js';

const result = await createPreview({
  title: "My Preview Page",
  content: "<h2>Hello World!</h2><p>This is a test.</p>",
  bucket: "my-bucket",
  topic: "my-notifications"
});

console.log(result.deployedUrl);
```

## Configuration

The tool uses these defaults:

- **Bucket**: `rhapp-dev`
- **Topic**: `dev-preview`
- **Output**: `./dist/preview.html`

## Requirements

- **rclone** configured with R2 credentials
- **Bun** runtime (or Node.js)
- Network access to `ntfy.rhappsody.com`

## rclone Setup

Ensure rclone is configured with your R2 credentials:

```bash
rclone config
# Follow prompts to configure 'r2' remote for Cloudflare R2
```

## HTML Template

The generated HTML includes:

- Responsive design with modern CSS
- Clean typography using system fonts
- Structured layout with header, content, and footer
- Timestamp and branding information
- Mobile-friendly viewport settings

## Notification Features

- Priority level 3 (default with sound)
- Tagged with 🔍 and "preview" 
- Clickable link to deployed page
- Title and timestamp in message

## Examples

### Simple Preview
```bash
npm start "Quick Test"
```

### Rich Content
```bash
npm start "Feature Demo" "
<h2>New Feature</h2>
<p>Check out this new functionality:</p>
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
<pre><code>console.log('Hello World!');</code></pre>
"
```

## Development

```bash
npm install
npm run dev    # Watch mode
npm run build  # Build for production
```

## Output

The tool outputs:
- Local HTML file in `./dist/`
- Deployed URL on R2
- Notification to configured topic
- Console status updates with colored output