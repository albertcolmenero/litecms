"use client";

export function MarkdownGuide() {
    const copyToClipboard = () => {
        const guideText = `
You are an expert content creator for LiteCMS. Use the following syntax to generate high-quality landing pages.

### Core Structure
- Use YAML frontmatter for metadata (title, description).
- Use standard Markdown for basic formatting.

### Advanced Layouts
Use \`::::section{layout="..."}\` for sections.
- "100" (Default full width)
- "50-50", "60-40", "40-60" (Two columns)
- "33-33-33" (Three columns)
- "20-60-20" (Centered content with margins)

Inside sections, use \`:::column\` to wrap content.

### Components
- **Cards**: \`:::card\` wraps content in a styled card.
- **Buttons**: \`::button[Label]{href="#" variant="primary|secondary"}\`
- **Icons**: \`::icon{name="IconName"}\` (Lucide icon names)

### Styling
- **Backgrounds**: Add \`bg="primary|secondary|muted"\` to sections/cards.
- **Alignment**: Add \`align="center|right|justify"\` to sections/columns.
- **Text Color**: \`:text[Highlighed]{color="primary"}\`

### Example
::::section{layout="50-50" bg="muted"}
  :::column
    # Hero Title
    ::button[Get Started]{href="/signup"}
  :::
  :::column{align="center"}
    ::icon{name="Rocket" className="w-12 h-12 text-primary"}
  :::
::::
`;
        navigator.clipboard.writeText(guideText);
        alert("Prompt copied to clipboard!");
    };

    return (
        <div className="bg-gray-50 border rounded-lg p-4 text-sm text-gray-700 h-full overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-black">Markdown Guide</h3>
                <button
                    onClick={copyToClipboard}
                    className="px-3 py-1 text-xs bg-black text-white rounded hover:bg-gray-800 transition-colors"
                >
                    Copy for LLM
                </button>
            </div>

            <div className="space-y-6">
                <section>
                    <h4 className="font-semibold mb-2 text-black">Page Metadata (Frontmatter)</h4>
                    <p className="mb-2">Add YAML frontmatter at the top of your document to configure page settings:</p>
                    <div className="bg-gray-100 p-2 rounded font-mono text-xs whitespace-pre overflow-x-auto border mb-4">
                        {`---
title: Page Title
description: SEO Description
name: Menu Label
menu:
  main: true    # Show in Main Menu
  footer: false # Hide from Footer
---`}
                    </div>
                </section>

                <section>
                    <h4 className="font-semibold mb-2 text-black">Basic Formatting</h4>
                    <ul className="list-disc list-inside space-y-1">
                        <li>**Bold**: <code>**text**</code></li>
                        <li>*Italic*: <code>*text*</code></li>
                        <li># Heading 1</li>
                        <li>## Heading 2</li>
                        <li>- Unordered List</li>
                        <li>1. Ordered List</li>
                        <li>[Link Text](url)</li>
                        <li>![Alt Text](image-url)</li>
                    </ul>
                </section>

                <section>
                    <h4 className="font-semibold mb-2 text-black">Advanced Layouts</h4>
                    <p className="mb-2">Use the following syntax to create multi-column layouts:</p>

                    <div className="bg-gray-100 p-2 rounded font-mono text-xs whitespace-pre overflow-x-auto border">
                        {`::::section{layout="50-50"}
  :::column
    Left Content...
  :::
  :::column
    Right Content...
  :::
::::`}
                    </div>

                    <div className="mt-4">
                        <p className="font-semibold mb-1">Supported Layouts:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                            <li><code>"50-50"</code> (Two equal columns)</li>
                            <li><code>"60-40"</code> (Left wider)</li>
                            <li><code>"40-60"</code> (Right wider)</li>
                            <li><code>"33-33-33"</code> (Three columns)</li>
                            <li><code>"20-60-20"</code> (Wide center column)</li>
                            <li><code>"100"</code> (Full width - default)</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h4 className="font-semibold mb-2 text-black">Icons</h4>
                    <p className="mb-2">Insert Lucide icons. Note: Icons are now styled as floating feature icons (absolute positioned).</p>
                    <div className="bg-gray-100 p-2 rounded font-mono text-xs whitespace-pre overflow-x-auto border">
                        {`:::div{className="relative pl-16"}
  ::icon{name="Rocket"}
  ### Feature Title
  Description...
:::`}
                    </div>
                </section>

                <section>
                    <h4 className="font-semibold mb-2 text-black">Components</h4>

                    <div className="space-y-4">
                        <div>
                            <p className="mb-1 font-medium text-xs">Card</p>
                            <div className="bg-gray-100 p-2 rounded font-mono text-xs whitespace-pre overflow-x-auto border">
                                {`:::card
### Card Title
Card content goes here.
:::`}
                            </div>
                        </div>

                        <div>
                            <p className="mb-1 font-medium text-xs">Button</p>
                            <div className="bg-gray-100 p-2 rounded font-mono text-xs whitespace-pre overflow-x-auto border">
                                {`::button[Primary]{href = "/contact"}
                                ::button[Secondary]{href = "/about" variant="secondary"}`}
                            </div>
                        </div>

                        <div>
                            <p className="mb-1 font-medium text-xs">Embedded HTML</p>
                            <p className="mb-1 text-xs text-gray-500">You can use raw HTML for custom elements.</p>
                            <div className="bg-gray-100 p-2 rounded font-mono text-xs whitespace-pre overflow-x-auto border">
                                {`<div className="p-4 bg-orange-100 rounded">
  Custom HTML content
</div>`}
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h4 className="font-semibold mb-2 text-black">Styling</h4>

                    <div className="space-y-4">
                        <div>
                            <p className="mb-1 font-medium text-xs">Background Colors</p>
                            <p className="mb-1 text-xs text-gray-500">Add <code>bg="color-id"</code> to Sections, Columns, or Cards. Top-level sections with backgrounds will span the full screen width.</p>
                            <div className="bg-gray-100 p-2 rounded font-mono text-xs whitespace-pre overflow-x-auto border">
                                {`::::section{layout="100" bg="primary"}
  :::column{bg="background"}
    Content on site background...
  :::
::::`}
                            </div>
                        </div>

                        <div>
                            <p className="mb-1 font-medium text-xs">Alignment</p>
                            <p className="mb-1 text-xs text-gray-500">Add <code>align="center|right|justify"</code> to Sections, Columns, or Cards.</p>
                            <div className="bg-gray-100 p-2 rounded font-mono text-xs whitespace-pre overflow-x-auto border">
                                {`::::section{align="center"}
  Centered content...
::::`}
                            </div>
                        </div>

                        <div>
                            <p className="mb-1 font-medium text-xs">Text Colors</p>
                            <p className="mb-1 text-xs text-gray-500">Highlight text with site colors.</p>
                            <div className="bg-gray-100 p-2 rounded font-mono text-xs whitespace-pre overflow-x-auto border">
                                {`This contains :text[highlighted text]{color="primary"}.`}
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h4 className="font-semibold mb-2 text-black">Troubleshooting</h4>
                    <ul className="list-disc list-inside space-y-2 text-xs text-gray-600">
                        <li>
                            <span className="font-semibold text-gray-800">Directives showing as text?</span>
                            <br />Check for syntax errors carefully.
                            <br />❌ <code>::::section{"{layout=\"33-33-33*}"}</code>
                            <br />✅ <code>::::section{"{layout=\"33-33-33\"}"}</code>
                        </li>
                        <li>
                            <span className="font-semibold text-gray-800">Nesting Strategy</span>
                            <br />To ensure infinite nesting works correctly, use <b>4 colons (::::)</b> for Sections and <b>3 colons (:::)</b> for Columns and Cards.
                            <br />
                            <div className="bg-gray-100 p-2 rounded font-mono text-xs whitespace-pre overflow-x-auto border mt-1">
                                {`::::section{layout="40-60"}
  :::column
    :::card
      ### Nested Layout
      ::::section{layout="50-50"}
        :::column
          Left
        :::
        :::column
          Right
        :::
      ::::
    :::
  :::
  :::column
    Right Sidebar
  :::
::::`}
                            </div>
                        </li>
                        <li>
                            <span className="font-semibold text-gray-800">Spacing & Indentation</span>
                            <br />Ensure you have blank lines around your directives.
                            <br /><b>Important:</b> Do not indent the closing <code>::::</code> or <code>:::</code>. They must be at the start of the line.
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
