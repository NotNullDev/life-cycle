import React from "react";

export type TypographyMutedProps = React.ComponentPropsWithRef<"p">
export function TypographyMuted({children, ref, ...props}: TypographyMutedProps) {
  return (
    <p className="text-sm text-muted-foreground" ref={ref} {...props}>
      {children}
    </p>
  )
}
