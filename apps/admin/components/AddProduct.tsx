"use client";

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/ui";
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
} from "@repo/ui";
import { Input } from "@repo/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import { Button } from "@repo/ui";
import { Textarea } from "@repo/ui";
import { Checkbox } from "@repo/ui";
import { ScrollArea } from "@repo/ui";
import {
  BrandType,
  CategoryType,
  ProductClassificationType,
  ProductConditionList,
  ProductFormSchema,
  ProductStatusList,
  SellerTypeList,
} from "@/types/admin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const fetchCategories = async (): Promise<CategoryType[]> => {
  const res = await fetch("/api/admin/categories");
  if (!res.ok) throw new Error("Failed to fetch categories!");
  return await res.json();
};

const fetchBrands = async (): Promise<BrandType[]> => {
  const res = await fetch("/api/admin/brands");
  if (!res.ok) return [];
  return await res.json();
};

const fetchClassifications = async (): Promise<ProductClassificationType[]> => {
  const res = await fetch("/api/admin/classifications");
  if (!res.ok) return [];
  return await res.json();
};

const AddProduct = () => {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof ProductFormSchema>>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: "",
      shortDescription: "",
      description: "",
      price: 0,
      discount: 0,
      stock: 1,
      condition: "new",
      status: "new",
      classificationId: "",
      categoryId: "",
      brandId: "",
      sellerType: "personal",
      featured: false,
      isFlashSale: false,
      isStudentDeal: false,
      isClearance: false,
      isBlackFriday: false,
      sizes: [],
      colors: [],
      images: {},
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
  });

  const { data: classifications } = useQuery({
    queryKey: ["classifications"],
    queryFn: fetchClassifications,
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof ProductFormSchema>) => {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create product!");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Product created successfully");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create product");
    },
  });

  return (
    <SheetContent className="w-full sm:max-w-xl">
      <ScrollArea className="h-[calc(100vh-4rem)] pr-4">
        <SheetHeader>
          <SheetTitle className="mb-2">Add Store Product</SheetTitle>
          <SheetDescription asChild>
            <Form {...form}>
              <form
                className="space-y-5"
                onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Title *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Apple iPhone 15 Pro Max 256GB - Like New" />
                      </FormControl>
                      <FormDescription>
                        Include brand, model, spec, and condition.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (GH₵) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Qty *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                              {ProductConditionList.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                  {c.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grading / Badge *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select grading" />
                            </SelectTrigger>
                            <SelectContent>
                              {ProductStatusList.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {classifications && classifications.length > 0 && (
                    <FormField
                      control={form.control}
                      name="classificationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Classification</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Classification" />
                              </SelectTrigger>
                              <SelectContent>
                                {classifications.map((cl) => (
                                  <SelectItem key={cl._id} value={cl._id}>
                                    {cl.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {categories && categories.length > 0 && (
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((cat: CategoryType) => (
                                  <SelectItem
                                    key={cat._id || cat.slug}
                                    value={String(cat._id || cat.slug)}
                                  >
                                    {cat.title || cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {brands && brands.length > 0 && (
                    <FormField
                      control={form.control}
                      name="brandId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select brand" />
                              </SelectTrigger>
                              <SelectContent>
                                {brands.map((b) => (
                                  <SelectItem key={b._id} value={b._id}>
                                    {b.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="sellerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seller Channel</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select seller type" />
                          </SelectTrigger>
                          <SelectContent>
                            {SellerTypeList.map((st) => (
                              <SelectItem key={st.value} value={st.value}>
                                {st.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2 border p-3 rounded-lg bg-muted/30">
                  <FormLabel className="text-xs font-semibold text-muted-foreground uppercase">
                    Promotional Showcases
                  </FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="feat-prod"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <label htmlFor="feat-prod" className="text-xs cursor-pointer">
                            Featured Item
                          </label>
                        </div>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isFlashSale"
                      render={({ field }) => (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="flash-prod"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <label htmlFor="flash-prod" className="text-xs cursor-pointer">
                            Flash Deal
                          </label>
                        </div>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isStudentDeal"
                      render={({ field }) => (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="student-prod"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <label htmlFor="student-prod" className="text-xs cursor-pointer">
                            Student Deal
                          </label>
                        </div>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Summary</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Brief highlight for catalog search & cards"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description / Specs</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={4}
                          placeholder="Technical specifications, cosmetic condition, battery health, included accessories..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mutation.isPending ? "Creating Product..." : "Create Product in Sanity"}
                </Button>
              </form>
            </Form>
          </SheetDescription>
        </SheetHeader>
      </ScrollArea>
    </SheetContent>
  );
};

export default AddProduct;

