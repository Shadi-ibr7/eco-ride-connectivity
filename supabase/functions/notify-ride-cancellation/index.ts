import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CancellationRequest {
  rideId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { rideId }: CancellationRequest = await req.json();

    console.log("Processing cancellation for ride:", rideId);

    // Get ride details with passenger information through bookings
    const { data: ride, error: rideError } = await supabase
      .from("rides")
      .select(`
        *,
        profile:profiles!rides_user_id_fkey(name),
        bookings:ride_bookings(
          passenger:profiles(
            id,
            name
          )
        )
      `)
      .eq("id", rideId)
      .single();

    if (rideError) {
      console.error("Error fetching ride:", rideError);
      throw rideError;
    }

    if (!ride) {
      throw new Error("Ride not found");
    }

    console.log("Found ride with bookings:", ride);

    // For each booking, get the passenger's email from auth.users
    const emailPromises = ride.bookings.map(async (booking: any) => {
      const passenger = booking.passenger;
      if (!passenger) {
        console.log("No passenger found for booking");
        return;
      }

      try {
        // Get user's email from auth.users using the profile id
        const { data: userData, error: userError } = await supabase
          .auth
          .admin
          .getUserById(passenger.id);

        if (userError) {
          console.error("Error fetching user data:", userError);
          throw userError;
        }

        if (!userData?.email) {
          console.error("No email found for user:", passenger.id);
          return;
        }

        console.log("Sending email to:", userData.email);

        const emailContent = {
          from: "Eco Ride <notification@ecoride.com>",
          to: [userData.email],
          subject: "Annulation de votre covoiturage",
          html: `
            <h2>Votre covoiturage a été annulé</h2>
            <p>Bonjour ${passenger.name},</p>
            <p>Nous vous informons que votre covoiturage de ${ride.departure_city} à ${ride.arrival_city} 
            prévu le ${new Date(ride.departure_date).toLocaleDateString('fr-FR')} a été annulé.</p>
            <p>Vos crédits ont été remboursés automatiquement.</p>
            <p>Cordialement,<br>L'équipe Eco Ride</p>
          `,
        };

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify(emailContent),
        });

        const responseText = await res.text();
        console.log("Resend API response:", responseText);

        if (!res.ok) {
          throw new Error(`Failed to send email: ${responseText}`);
        }

        console.log("Email sent successfully to:", userData.email);
      } catch (error) {
        console.error(`Error processing email for passenger ${passenger.name}:`, error);
        throw error;
      }
    });

    await Promise.all(emailPromises);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in notify-ride-cancellation function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);