import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Message envoyé avec succès !");
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'envoi du message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-grass-50">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Mail className="mx-auto h-12 w-12 text-grass-600" />
            <h1 className="mt-4 text-3xl font-bold text-grass-900">Contactez-nous</h1>
            <p className="mt-2 text-grass-700">
              Une question ? N'hésitez pas à nous contacter !
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-grass-700">
                Nom
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-grass-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-grass-700">
                Message
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="mt-1 h-32"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-grass-600 hover:bg-grass-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Envoi en cours..." : "Envoyer"}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;