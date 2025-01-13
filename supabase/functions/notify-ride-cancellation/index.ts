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
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { rideId }: CancellationRequest = await req.json();

    // Get ride details and passengers
    const { data: ride } = await supabase
      .from("rides")
      .select(`
        *,
        profile:profiles!rides_user_id_fkey(name),
        bookings:ride_bookings(
          passenger:profiles(
            name,
            id
          )
        )
      `)
      .eq("id", rideId)
      .single();

    if (!ride) {
      throw new Error("Ride not found");
    }

    // Send email to each passenger
    const emailPromises = ride.bookings.map(async (booking: any) => {
      const passenger = booking.passenger;
      if (!passenger) return;

      const emailContent = {
        from: "Eco Ride <notification@ecoride.com>",
        to: [passenger.id], // Using passenger ID as email for now
        subject: "Annulation de votre covoiturage",
        html: `
          <h2>Votre covoiturage a été annulé</h2>
          <p>Bonjour ${passenger.name},</p>
          <p>Nous vous informons que votre covoiturage de ${ride.departure_city} à ${ride.arrival_city} 
          prévu le ${new Date(ride.departure_date).toLocaleDateString('fr-FR')} a été annulé par le conducteur.</p>
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

      if (!res.ok) {
        throw new Error(`Failed to send email to ${passenger.name}`);
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