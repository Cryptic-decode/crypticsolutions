import { ProductLanding } from "@/components/marketing/product-landing";

export default function IELTSManualPage() {
  return <ProductLanding
    productId="ielts-manual"
    productName="IELTS Preparation Manual"
    kind="ielts"
    eyebrow="IELTS preparation · protected online access"
    title="Prepare with a clearer understanding of the IELTS test."
    description="A structured manual for Listening, Reading, Writing, and Speaking, with practical strategies you can apply throughout your preparation."
    price={5000}
    accessLabel="Protected online library"
    problemTitle="Preparation should feel structured, not overwhelming."
    problemCopy={["Many candidates spend months studying English without learning how the IELTS test actually evaluates them.", "This manual focuses on the test itself: what each section expects, how to approach it strategically, and where to direct your practice time."]}
    features={[
      { title: "Clear section breakdowns", description: "Understand the format, expectations, and scoring priorities across all four sections." },
      { title: "Practical strategies", description: "Use repeatable approaches for managing time, structuring answers, and avoiding common mistakes." },
      { title: "Examples and guided practice", description: "Connect each strategy to concrete prompts, exercises, and scoring insights." },
      { title: "Progress that stays with you", description: "Read through your protected dashboard and continue from your last saved page." },
    ]}
    audience={["You are preparing for your first IELTS attempt and want a structured starting point.", "You have taken the test before but need a more strategic approach.", "You prefer self-paced study with clear explanations and practical examples.", "You need IELTS for study, migration, or professional opportunities."]}
    purchaseTitle="Get the complete IELTS preparation manual."
    purchaseCopy="One payment gives you protected online access through your Cryptic Solutions dashboard."
    successPath="/payment/success"
    referralEnabled
  />;
}
