"use client";

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { CategoryFormSchema, CategoryLevelList, ProductClassificationType } from "@/types/admin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const AddCategory = () => {
  const queryClient = useQueryClient();

  const { data: classifications = [] } = useQuery<ProductClassificationType[]>({
    queryKey: ["product-classifications"],
    queryFn: async () => {
      const res = await fetch("/api/admin/classifications");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const form = useForm<z.infer<typeof CategoryFormSchema>>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      productClassificationId: "",
      parentId: "",
      level: "leaf",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof CategoryFormSchema>) => {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create category!");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Category created successfully");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create category");
    },
  });

  return (
    <SheetContent className="overflow-y-auto">
      <SheetHeader>
        <SheetTitle className="mb-2">Add Sanity Category</SheetTitle>
        <SheetDescription asChild>
          <Form {...form}>
            <form
              className="space-y-4 text-left"
              onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. Laptops & Ultrabooks"
                        onChange={(e) => {
                          field.onChange(e);
                          if (!form.getValues("slug")) {
                            form.setValue(
                              "slug",
                              e.target.value
                                .toLowerCase()
                                .replace(/\s+/g, "-")
                                .replace(/[^a-z0-9-]/g, "")
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>Official Sanity category title.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. laptops-ultrabooks" />
                    </FormControl>
                    <FormDescription>URL-safe identifier.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productClassificationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Classification (Root)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select classification tier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classifications.map((item) => (
                          <SelectItem key={item._id || item.slug} value={item._id}>
                            {item.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Sanity productClassificationType reference.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Hierarchy Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select hierarchy level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CategoryLevelList.map((lvl) => (
                          <SelectItem key={lvl.value} value={lvl.value}>
                            {lvl.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Category description..." rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {mutation.isPending ? "Publishing to Sanity..." : "Create Category"}
              </Button>
            </form>
          </Form>
        </SheetDescription>
      </SheetHeader>
    </SheetContent>
  );
};

export default AddCategory;
