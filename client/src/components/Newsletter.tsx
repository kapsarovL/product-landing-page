import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." })
});

type FormValues = z.infer<typeof formSchema>;

export default function Newsletter() {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ""
    }
  });
  
  const subscription = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest("POST", "/api/subscribe", values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Successfully Subscribed!",
        description: "Thank you for joining our newsletter.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const onSubmit = (values: FormValues) => {
    subscription.mutate(values);
  };
  
  return (
    <section id="newsletter" className="py-16 bg-primary-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Community</h2>
          <p className="text-white/80 mb-8">Subscribe to our newsletter for exclusive deals, product updates, and audio tips.</p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input
                        placeholder="Your email address"
                        type="email"
                        required
                        className="px-4 py-6 rounded-md focus:outline-none focus:ring-2 focus:ring-white/30"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-white/90 text-sm mt-1" />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                disabled={subscription.isPending}
                className="px-6 py-6 bg-primary-300/50 text-white font-medium rounded-md hover:bg-primary-200/90 transition-colors"
              >
                {subscription.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </form>
          </Form>
          
          <p className="text-white/70 text-sm mt-4">We respect your privacy. Unsubscribe at any time.</p>
        </div>
      </div>
    </section>
  );
}
