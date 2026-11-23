import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  sendMobileVideoRegistrationAdminNotification,
  sendMobileVideoRegistrationWelcome,
} from "@/lib/mobile-video-editing-emails";
import { MOBILE_VIDEO_EXPERIENCE_LEVELS } from "@/lib/mobile-video-editing-program";

const registrationSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(160),
  phone: z.string().trim().max(40),
  experienceLevel: z.enum(MOBILE_VIDEO_EXPERIENCE_LEVELS),
  learningGoal: z.string().trim().max(400),
  acceptedUpdates: z.literal(true),
  middleName: z.string().max(100),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = registrationSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Check the form and complete all required fields." },
        { status: 400 },
      );
    }

    const registration = parsed.data;
    if (registration.middleName) {
      return NextResponse.json({ success: true, emailSent: true }, { status: 201 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Programme registration is temporarily unavailable." },
        { status: 503 },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase
      .from("mobile_video_editing_registrations")
      .insert({
        full_name: registration.fullName,
        email: registration.email,
        phone: registration.phone || null,
        experience_level: registration.experienceLevel,
        learning_goal: registration.learningGoal || null,
        accepted_updates: registration.acceptedUpdates,
      });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { success: true, emailSent: false, alreadyRegistered: true },
          { status: 200 },
        );
      }
      console.error("Mobile video registration insert error:", error);
      return NextResponse.json(
        { error: "We could not complete your registration. Please try again." },
        { status: 500 },
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL || "info@crypticsolutionsltd.com";
    const [welcome, adminNotification] = await Promise.all([
      sendMobileVideoRegistrationWelcome({
        fullName: registration.fullName,
        email: registration.email,
      }),
      sendMobileVideoRegistrationAdminNotification({
        to: adminEmail,
        fullName: registration.fullName,
        email: registration.email,
        phone: registration.phone,
        experienceLevel: registration.experienceLevel,
        learningGoal: registration.learningGoal,
      }),
    ]);

    if (!welcome.sent) {
      console.error("Mobile video welcome email could not be sent:", welcome.error);
    }
    if (!adminNotification.sent) {
      console.error(
        "Mobile video admin notification could not be sent:",
        adminNotification.error,
      );
    }

    return NextResponse.json(
      { success: true, emailSent: welcome.sent },
      { status: 201 },
    );
  } catch (error) {
    console.error("Mobile video registration error:", error);
    return NextResponse.json(
      { error: "We could not complete your registration. Please try again." },
      { status: 500 },
    );
  }
}
