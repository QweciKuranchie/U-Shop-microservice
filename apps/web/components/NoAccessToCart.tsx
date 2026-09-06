"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Logo from "./common/Logo";

const NoAccessToCart = ({ details }: { details?: string }) => {

  return (
    <div className="flex items-center justify-center py-12 md:py-32 bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome Back!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center font-medium">
            {details
              ? details
              : " Log in to view your cart items and checkout. Don't miss out on your favorite products!"}
          </p>
          <Button
            asChild
            className="w-full font-semibold cursor-pointer"
            size="lg"
          >
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground text-center">
            Don&rsquo;t have an account?
          </div>
          <Button
            asChild
            variant="outline"
            className="w-full cursor-pointer"
            size="lg"
          >
            <Link href="/sign-up">Create an account</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NoAccessToCart;
