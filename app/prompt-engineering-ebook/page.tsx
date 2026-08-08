import { ProductLanding } from "@/components/marketing/product-landing";

export default function PromptEngineeringEbookPage() {
  return <ProductLanding
    productId="talk-to-ai-like-a-pro"
    productName="Talk to AI like a Pro"
    kind="prompts"
    eyebrow="Prompt engineering · instant PDF download"
    title="Write clearer prompts and get more useful AI responses."
    description="Learn practical prompt structures, reusable templates, and the common mistakes that keep AI output vague or unhelpful."
    price={2000}
    accessLabel="Instant PDF download"
    problemTitle="Better AI output starts with a better request."
    problemCopy={["Most weak AI responses begin with prompts that lack context, direction, or a clear definition of success.", "This concise guide shows you how to structure requests deliberately, reuse proven patterns, and improve the result without endless trial and error."]}
    features={[
      { title: "Why prompts fail", description: "Recognize vague instructions, missing context, conflicting requirements, and other common problems." },
      { title: "A reliable prompt structure", description: "Build requests using clear roles, context, constraints, output formats, and examples." },
      { title: "Reusable templates", description: "Adapt practical starting points for writing, planning, analysis, learning, and everyday work." },
      { title: "A concise reading format", description: "Move through four focused chapters without unnecessary theory or filler." },
    ]}
    audience={["You use ChatGPT or similar tools but get inconsistent results.", "You want reusable prompts for everyday professional or personal work.", "You are new to prompt engineering and need a practical starting point.", "You prefer a short guide you can reference while working."]}
    purchaseTitle="Download the complete prompt engineering guide."
    purchaseCopy="Your payment is verified immediately, then the PDF is made available for download."
    successPath="/payment/ebook-success"
  />;
}
