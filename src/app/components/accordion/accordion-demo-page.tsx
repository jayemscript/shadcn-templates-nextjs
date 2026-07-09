// src/app/components/accordion/accordion-demo-page.tsx

"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Package, Code2, Palette, Keyboard, Zap } from "lucide-react";
import {
  AccordionComponent,
  AccordionVariant,
  VARIANT_OPTIONS,
  AccordionItemData,
} from "@/components/custom/accordion";
import { CodeBlock } from "@/components/custom/code-block";
import { VariantShowcase } from "@/components/custom/accordion/variant-showcase";

const demoItems: AccordionItemData[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    content: (
      <div className="space-y-2">
        <p>
          Welcome to the Accordion component! This is a fully customizable,
          accessible accordion built with React, TypeScript, and Tailwind CSS.
        </p>
        <p>
          It supports multiple variants, keyboard navigation, and follows
          accessibility best practices.
        </p>
      </div>
    ),
  },
  {
    id: "installation",
    title: "Installation & Setup",
    content: (
      <div className="space-y-3">
        <p>To get started, you need to install the required dependencies:</p>
        <CodeBlock
          language="bash"
          code={`npm install lucide-react clsx tailwind-merge`}
        />
        <p className="text-sm text-muted-foreground">
          Note: Make sure you have Shadcn UI components installed in your
          project.
        </p>
      </div>
    ),
  },
  {
    id: "usage",
    title: "Basic Usage",
    content: (
      <div className="space-y-3">
        <p>Import and use the AccordionComponent:</p>
        <CodeBlock
          filename="example.tsx"
          code={`import { AccordionComponent } from "@/components/custom/accordion";

const items = [
  {
    id: "item-1",
    title: "First Item",
    content: "This is the content of the first item."
  },
  {
    id: "item-2",
    title: "Second Item",
    content: "This is the content of the second item."
  }
];

function MyComponent() {
  return (
    <AccordionComponent
      variant="default"
      items={items}
      type="single"
      collapsible
    />
  );
}`}
        />
      </div>
    ),
  },
  {
    id: "variants",
    title: "Available Variants",
    content: (
      <div className="space-y-3">
        <p>The accordion supports 10 different visual variants:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {VARIANT_OPTIONS.map((v) => (
            <Badge key={v} variant="secondary" className="justify-center">
              {v}
            </Badge>
          ))}
        </div>
      </div>
    ),
  },
];

const installationCode = `# Install required dependencies
npm install lucide-react clsx tailwind-merge

# If you don't have Shadcn UI set up yet
npx shadcn-ui@latest init

# Add required Shadcn components
npx shadcn-ui@latest add select label button`;

const usageCode = `import { AccordionComponent } from "@/components/custom/accordion";

const items = [
  {
    id: "item-1",
    title: "What is React?",
    content: "React is a JavaScript library for building user interfaces."
  },
  {
    id: "item-2",
    title: "What is TypeScript?",
    content: "TypeScript is a typed superset of JavaScript."
  }
];

function App() {
  return (
    <AccordionComponent
      variant="default"
      items={items}
      type="single"
      collapsible
    />
  );
}`;

const advancedUsageCode = `import { AccordionComponent } from "@/components/custom/accordion";

// Interactive mode - users can switch variants
<AccordionComponent
  variant="glass"
  changeMode="interaction"
  items={items}
/>

// Both modes - initial variant via props, user can override
<AccordionComponent
  variant="card"
  changeMode="both"
  items={items}
  showControls
/>

// Multiple expansion mode
<AccordionComponent
  variant="outline"
  items={items}
  type="multiple"
  defaultValue={["item-1"]}
/>

// Controlled state
<AccordionComponent
  variant="gradient"
  items={items}
  onValueChange={(value) => console.log(value)}
/>`;

const apiReferenceCode = `interface AccordionComponentProps {
  // Visual style variant (10 options available)
  variant?: "default" | "outline" | "filled" | "ghost" | 
            "card" | "glass" | "gradient" | "minimal" | 
            "bordered" | "modern";
  
  // How variant can be changed
  changeMode?: "code" | "interaction" | "both";
  
  // Custom Tailwind classes
  className?: string;
  
  // Accordion items
  items?: Array<{
    id: string;
    title: string;
    content: React.ReactNode;
    disabled?: boolean;
  }>;
  
  // Default expanded item(s)
  defaultValue?: string | string[];
  
  // Single or multiple expansion
  type?: "single" | "multiple";
  
  // Allow collapsing all items
  collapsible?: boolean;
  
  // Callback when value changes
  onValueChange?: (value: string | string[]) => void;
  
  // Show variant selector controls
  showControls?: boolean;
}`;

export function AccordionDemoPage() {
  const [interactiveVariant, setInteractiveVariant] =
    useState<AccordionVariant>("glass");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-12 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Accordion Component
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                A versatile, accessible accordion with 10 beautiful variants
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1">
              <Code2 className="h-3 w-3" />
              TypeScript
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Palette className="h-3 w-3" />
              10 Variants
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Keyboard className="h-3 w-3" />
              Accessible
            </Badge>
          </div>
        </div>

        {/* Quick Start Alert */}
        <Alert className="mb-8">
          <Info className="h-4 w-4" />
          <AlertTitle>Quick Start</AlertTitle>
          <AlertDescription>
            Try the interactive demo below to see all variants in action. Switch
            between tabs to explore different features.
          </AlertDescription>
        </Alert>

        {/* Main Tabs */}
        <Tabs defaultValue="demo" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-150">
            <TabsTrigger value="demo">Live Demo</TabsTrigger>
            <TabsTrigger value="variants">All Variants</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
          </TabsList>

          {/* Live Demo Tab */}
          <TabsContent value="demo" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Interactive Demo</CardTitle>
                <CardDescription>
                  Try the accordion with different settings. Change the variant
                  and see how it adapts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 rounded-lg border bg-muted/20">
                  <AccordionComponent
                    variant={interactiveVariant}
                    changeMode="both"
                    items={demoItems}
                    type="single"
                    collapsible
                    showControls
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Try switching variants above!</h4>
                  <p className="text-sm text-muted-foreground">
                    The dropdown allows you to change the visual style at
                    runtime. This demonstrates the "both" changeMode.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Multiple Expansion Mode</CardTitle>
                <CardDescription>
                  Allow users to expand multiple items simultaneously
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccordionComponent
                  variant="outline"
                  items={demoItems}
                  type="multiple"
                  defaultValue={["getting-started"]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Variants Tab */}
          <TabsContent value="variants" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>All Available Variants</CardTitle>
                <CardDescription>
                  Browse through all 10 accordion variants side by side
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {VARIANT_OPTIONS.map((variant) => (
                  <div key={variant}>
                    <VariantShowcase variant={variant} />
                    {variant !==
                      VARIANT_OPTIONS[VARIANT_OPTIONS.length - 1] && (
                      <Separator className="my-8" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="docs" className="space-y-8">
            {/* Installation */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <CardTitle>Installation</CardTitle>
                </div>
                <CardDescription>
                  Get started by installing the required packages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CodeBlock
                  language="bash"
                  filename="terminal"
                  code={installationCode}
                />
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    <strong>Note:</strong> Make sure you have the following
                    Shadcn components installed:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Select</li>
                    <li>Label</li>
                    <li>Button</li>
                    <li>Tabs (for demo page)</li>
                    <li>Card (for demo page)</li>
                    <li>Badge (for demo page)</li>
                    <li>Alert (for demo page)</li>
                    <li>Separator (for demo page)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Basic Usage */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-primary" />
                  <CardTitle>Basic Usage</CardTitle>
                </div>
                <CardDescription>
                  Simple example to get you started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock filename="basic-example.tsx" code={usageCode} />
              </CardContent>
            </Card>

            {/* Advanced Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Advanced Usage</CardTitle>
                <CardDescription>
                  Explore different configuration options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  filename="advanced-examples.tsx"
                  code={advancedUsageCode}
                />
              </CardContent>
            </Card>

            {/* Props Table */}
            <Card>
              <CardHeader>
                <CardTitle>Component Props</CardTitle>
                <CardDescription>
                  All available props for customization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">
                          Prop
                        </th>
                        <th className="text-left py-3 px-4 font-semibold">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 font-semibold">
                          Default
                        </th>
                        <th className="text-left py-3 px-4 font-semibold">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-3 px-4 font-mono text-xs">variant</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          AccordionVariant
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">
                          "default"
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Visual style variant
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-mono text-xs">
                          changeMode
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          ChangeMode
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">"code"</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          How variant can be changed
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-mono text-xs">
                          className
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          string
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">-</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Custom Tailwind classes
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-mono text-xs">items</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          AccordionItemData[]
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">[]</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Accordion items to display
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-mono text-xs">type</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          "single" | "multiple"
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">
                          "single"
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Expansion behavior
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-mono text-xs">
                          collapsible
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          boolean
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">true</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Allow collapsing all items
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-mono text-xs">
                          defaultValue
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          string | string[]
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">-</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Initially expanded item(s)
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-mono text-xs">
                          onValueChange
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          (value) =&gt; void
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">-</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Callback on value change
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-mono text-xs">
                          showControls
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          boolean
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">auto</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          Show variant selector
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Reference Tab */}
          <TabsContent value="api" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>TypeScript API Reference</CardTitle>
                <CardDescription>
                  Complete type definitions for the Accordion component
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <CodeBlock filename="types.ts" code={apiReferenceCode} />

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Hook API</h3>
                  <CodeBlock
                    filename="use-accordion.ts"
                    code={`import { useAccordion } from "@/components/custom/accordion";

const {
  activeItems,           // Currently active item(s)
  currentVariant,        // Current visual variant
  toggleItem,            // Function to toggle an item
  setVariant,            // Function to change variant
  isItemActive,          // Check if item is active
  canChangeVariant,      // Can variant be changed?
  showVariantControls,   // Should show controls?
  type,                  // single or multiple
  collapsible,           // Can collapse all?
} = useAccordion({
  variant: "default",
  changeMode: "code",
  items: [],
  type: "single",
  collapsible: true,
});`}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Available Variants</h3>
                  <CodeBlock
                    filename="variants.ts"
                    code={`export type AccordionVariant =
  | "default"     // Classic Shadcn style
  | "outline"     // Bordered cards
  | "filled"      // Muted backgrounds
  | "ghost"       // Minimal accent highlights
  | "card"        // Elevated cards with shadows
  | "glass"       // Glassmorphism effect
  | "gradient"    // Gradient backgrounds
  | "minimal"     // Ultra-clean dividers
  | "bordered"    // Bold borders
  | "modern";     // Rounded with animations`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Separator className="my-12" />
        <div className="text-center text-sm text-muted-foreground">
          <p>Built with React, TypeScript, Tailwind CSS, and Shadcn UI</p>
          <p className="mt-2">
            Fully accessible • Production ready • Easy to customize
          </p>
        </div>
      </div>
    </div>
  );
}
