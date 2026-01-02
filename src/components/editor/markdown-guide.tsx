
"use client";

export function MarkdownGuide() {
    return (
        <div className="bg-gray-50 border rounded-lg p-4 text-sm text-gray-700 h-full overflow-y-auto">
            <h3 className="font-bold text-lg mb-4 text-black">Markdown Guide</h3>

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
                        {`:::::section{layout="50-50"}
::::column
Left Content...
::::
::::column
Right Content...
::::
:::::`}
                    </div>

                    <div className="mt-4">
                        <p className="font-semibold mb-1">Supported Layouts:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                            <li><code>"50-50"</code> (Two equal columns)</li>
                            <li><code>"60-40"</code> (Left wider)</li>
                            <li><code>"40-60"</code> (Right wider)</li>
                            <li><code>"33-33-33"</code> (Three columns)</li>
                            <li><code>"100"</code> (Full width - default)</li>
                        </ul>
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
                                {`::button[Click Me]{href="/contact"}`}
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
                    <h4 className="font-semibold mb-2 text-black">Troubleshooting</h4>
                    <ul className="list-disc list-inside space-y-2 text-xs text-gray-600">
                        <li>
                            <span className="font-semibold text-gray-800">Directives showing as text?</span>
                            <br />Check for syntax errors carefully.
                            <br />❌ <code>:::::section{"{layout=\"33-33-33*}"}</code>
                            <br />✅ <code>:::::section{"{layout=\"33-33-33\"}"}</code>
                        </li>
                        <li>
                            <span className="font-semibold text-gray-800">Nesting Strategy</span>
                            <br />Use different fence lengths for each level:
                            <br />1. Section: <code>:::::</code> (5 colons)
                            <br />2. Column: <code>::::</code> (4 colons)
                            <br />3. Card: <code>:::</code> (3 colons)
                        </li>
                        <li>
                            <span className="font-semibold text-gray-800">Spacing</span>
                            <br />Ensure you have blank lines around your directives if they aren't rendering correctly.
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
