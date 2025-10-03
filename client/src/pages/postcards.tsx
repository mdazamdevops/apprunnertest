import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navigation } from "../components/navigation";
import { ObjectUploader } from "../components/ObjectUploader";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";

const postcardSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Image is required"),
  isPublic: z.boolean()
});

type PostcardForm = z.infer<typeof postcardSchema>;

type Postcard = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  isPublic: string;
};

export default function PostcardsPage() {
  const [isPublic, setIsPublic] = useState(true);
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const form = useForm<PostcardForm>({
    resolver: zodResolver(postcardSchema),
    defaultValues: { title: "", description: "", imageUrl: "", isPublic: true }
  });

  useEffect(() => {
    form.setValue("isPublic", isPublic);
  }, [form, isPublic]);

  const postcardsQuery = useQuery<Postcard[]>({
    queryKey: ["/api/postcards"],
    queryFn: async () => {
      const { data } = await axios.get<Postcard[]>("/api/postcards");
      return data;
    }
  });

  const createPostcard = useMutation({
    mutationFn: async (data: PostcardForm) => {
      await axios.post("/api/postcards", {
        ...data,
        isPublic: data.isPublic ? "true" : "false"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/postcards"] });
      form.reset();
      setIsPublic(true);
      toast("Postcard saved", "success");
    },
    onError: () => {
      toast("Failed to save postcard", "error");
    }
  });

  const createOrder = useMutation({
    mutationFn: async (postcardId: string) => {
      const { data } = await axios.post<{ orderId: string; clientSecret: string }>("/api/postcard-orders", {
        postcardId
      });
      return data;
    },
    onSuccess: ({ orderId, clientSecret }) => {
      sessionStorage.setItem(`postcard-order-${orderId}`, clientSecret);
      navigate(`/postcard-checkout?orderId=${orderId}`);
    },
    onError: () => {
      toast("Unable to create postcard order", "error");
    }
  });

  const handleUploadComplete = (url: string) => {
    form.setValue("imageUrl", url, { shouldValidate: true });
  };

  const postcards = useMemo(() => postcardsQuery.data ?? [], [postcardsQuery.data]);

  return (
    <div>
      <Navigation />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        <section className="rounded border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Upload new postcard</h2>
          <form className="mt-4 space-y-4" onSubmit={form.handleSubmit((data) => createPostcard.mutate(data))}>
            <div>
              <label className="block text-sm font-medium" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                {...form.register("title")}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                data-testid="input-title"
              />
              {form.formState.errors.title && (
                <p className="mt-1 text-xs text-red-600" data-testid="error-title">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                {...form.register("description")}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                data-testid="textarea-description"
              />
            </div>
            <div>
              <span className="block text-sm font-medium">Upload image</span>
              <ObjectUploader onUploadComplete={handleUploadComplete} isPublic={isPublic} />
              {form.formState.errors.imageUrl && (
                <p className="mt-1 text-xs text-red-600" data-testid="error-image">
                  {form.formState.errors.imageUrl.message}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isPublic"
                type="checkbox"
                checked={isPublic}
                onChange={(event) => {
                  setIsPublic(event.target.checked);
                  form.setValue("isPublic", event.target.checked);
                }}
                data-testid="switch-public"
              />
              <label htmlFor="isPublic" className="text-sm">
                Make postcard public
              </label>
            </div>
            <input type="hidden" {...form.register("imageUrl")} />
            <Button type="submit" data-testid="button-save-postcard" disabled={createPostcard.isPending}>
              {createPostcard.isPending ? "Saving..." : "Save postcard"}
            </Button>
          </form>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Your postcards</h3>
          {postcardsQuery.isLoading ? (
            <p className="text-sm text-slate-500" data-testid="text-postcards-loading">
              Loading postcards...
            </p>
          ) : postcardsQuery.isError ? (
            <p className="text-sm text-red-600" data-testid="text-postcards-error">
              Failed to load postcards.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {postcards.map((postcard) => (
                <article
                  key={postcard.id}
                  className="rounded border border-slate-200 bg-white p-4 shadow-sm"
                  data-testid={`card-postcard-${postcard.id}`}
                >
                  <img src={postcard.imageUrl} alt={postcard.title} className="h-40 w-full rounded object-cover" />
                  <h4 className="mt-3 text-lg font-semibold">{postcard.title}</h4>
                  <p className="mt-1 text-sm text-slate-600">{postcard.description}</p>
                  <Button
                    className="mt-4"
                    type="button"
                    data-testid={`button-order-${postcard.id}`}
                    onClick={() => createOrder.mutate(postcard.id)}
                    disabled={createOrder.isPending}
                  >
                    {createOrder.isPending ? "Preparing checkout..." : "Order 20 for $10"}
                  </Button>
                </article>
              ))}
              {postcards.length === 0 && (
                <p className="text-sm text-slate-500" data-testid="text-no-postcards">
                  No postcards yet. Upload your first design above.
                </p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
