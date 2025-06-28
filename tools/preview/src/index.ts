#!/usr/bin/env node
import { lightBlue, lightGreen, lightYellow, lightRed } from "ansicolor";
import { join } from "path";
import { writeFileSync, mkdirSync, existsSync } from "fs";

interface PreviewOptions {
  title?: string;
  content?: string;
  output?: string;
  bucket?: string;
  topic?: string;
  url?: string;
}

// Generate a basic HTML template
function generateHTML(title: string = "Preview", content: string = "Hello World!"): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 2rem auto;
            padding: 2rem;
            line-height: 1.6;
            color: #333;
        }
        .header {
            border-bottom: 2px solid #007acc;
            padding-bottom: 1rem;
            margin-bottom: 2rem;
        }
        .content {
            background: #f8f9fa;
            padding: 2rem;
            border-radius: 8px;
            border-left: 4px solid #007acc;
        }
        .footer {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #eee;
            font-size: 0.9em;
            color: #666;
        }
        pre {
            background: #f4f4f4;
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
        }
        code {
            background: #f4f4f4;
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
            font-family: 'Monaco', 'Consolas', monospace;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
    </div>
    
    <div class="content">
        ${content}
    </div>
    
    <div class="footer">
        <p>Generated at: ${new Date().toISOString()}</p>
        <p>Preview tool - Rhappsody Development</p>
    </div>
</body>
</html>`;
}

// Send notification using ntfy
async function sendNotification(topic: string, message: string, title?: string, url?: string) {
  try {
    const payload: any = { 
      topic, 
      message,
      priority: 3,
      tags: ["🔍", "preview"]
    };
    
    if (title) payload.title = title;
    if (url) payload.click = url;
    
    const response = await fetch(`https://ntfy.rhappsody.com/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    
    if (response.ok) {
      console.log(lightGreen(`✅ Notification sent to topic: ${topic}`));
    } else {
      console.log(lightYellow(`⚠️ Notification failed: ${response.statusText}`));
    }
  } catch (error) {
    console.log(lightRed(`❌ Notification error: ${error}`));
  }
}

// Deploy to R2 using rclone
async function deployToR2(filePath: string, bucket: string, remotePath: string): Promise<string | null> {
  try {
    console.log(lightBlue(`📤 Deploying ${filePath} to ${bucket}/${remotePath}...`));
    
    const rcloneProcess = Bun.spawn([
      "rclone", 
      "copy", 
      filePath, 
      `r2:${bucket}/`,
      "--progress"
    ]);
    
    const output = await new Response(rcloneProcess.stdout).text();
    const errorOutput = await new Response(rcloneProcess.stderr).text();
    
    // Wait for the process to complete
    await rcloneProcess.exited;
    
    if (rcloneProcess.exitCode === 0) {
      console.log(lightGreen(`✅ Successfully deployed to R2`));
      const deployedUrl = `https://${bucket}/${remotePath}`;
      console.log(lightBlue(`🔗 URL: ${deployedUrl}`));
      return deployedUrl;
    } else {
      console.log(lightRed(`❌ R2 deployment failed:`));
      console.log(errorOutput);
      return null;
    }
  } catch (error) {
    console.log(lightRed(`❌ R2 deployment error: ${error}`));
    return null;
  }
}

// Main preview function
export async function createPreview(options: PreviewOptions = {}) {
  const {
    title = "Development Preview",
    content = "<h2>Welcome to the preview!</h2><p>This is a generated preview page.</p>",
    output = "./preview.html",
    bucket = "app-rhapdev",
    topic = "dev-preview",
    url
  } = options;

  try {
    // Generate HTML
    console.log(lightBlue(`🎨 Generating HTML preview...`));
    const html = generateHTML(title, content);
    
    // Ensure output directory exists
    const outputDir = join(process.cwd(), "dist");
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = join(outputDir, "preview.html");
    writeFileSync(outputPath, html);
    console.log(lightGreen(`✅ HTML generated: ${outputPath}`));
    
    // Deploy to R2
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const remotePath = `preview-${timestamp}.html`;
    const deployedUrl = await deployToR2(outputPath, bucket, remotePath);
    
    // Send notification
    if (deployedUrl && topic) {
      await sendNotification(
        topic,
        `Preview deployed successfully!\n\nTitle: ${title}\nTimestamp: ${new Date().toLocaleString()}`,
        "🔍 Preview Ready",
        deployedUrl
      );
    }
    
    return {
      success: true,
      localPath: outputPath,
      deployedUrl,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(lightRed(`❌ Preview creation failed: ${errorMessage}`));
    return {
      success: false,
      error: errorMessage
    };
  }
}

// CLI interface
if (import.meta.main) {
  const args = process.argv.slice(2);
  const title = args[0] || "Development Preview";
  const content = args[1] || "<h2>Hello from preview tool!</h2><p>This is a test preview page.</p>";
  
  console.log(lightBlue(`🚀 Creating preview: "${title}"`));
  
  const result = await createPreview({
    title,
    content,
    bucket: "app-rhapdev",
    topic: "dev-preview"
  });
  
  if (result.success) {
    console.log(lightGreen(`\n🎉 Preview created successfully!`));
    if (result.deployedUrl) {
      console.log(lightBlue(`🔗 URL: ${result.deployedUrl}`));
    }
  } else {
    console.log(lightRed(`\n❌ Preview creation failed: ${result.error}`));
    process.exit(1);
  }
}