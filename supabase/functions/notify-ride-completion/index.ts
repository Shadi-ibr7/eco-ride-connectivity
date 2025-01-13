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

interface CompletionRequest {
  rideId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { rideId }: CompletionRequest = await req.json();

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
        subject: "Votre trajet est terminé - Donnez votre avis",
        html: `
          <h2>Votre trajet est terminé</h2>
          <p>Bonjour ${passenger.name},</p>
          <p>Votre trajet de ${ride.departure_city} à ${ride.arrival_city} est maintenant terminé.</p>
          <p>Merci de vous connecter à votre espace pour valider que tout s'est bien passé et donner votre avis sur le trajet.</p>
          <p>Votre retour nous aidera à améliorer l'expérience pour tous les utilisateurs.</p>
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
    console.error("Error in notify-ride-completion function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);