import DiamondIcon from "./svg/pixel-diamond.svg";
import DiamondIconEmpty from "./svg/pixel-diamond-empty.svg";

export const Diamond = (
  {filled = true, ...props}: React.SVGProps<SVGSVGElement> & { filled?: boolean },
) =>
  filled ? (
    <DiamondIcon
      {...props}
      style={{ width: "100%", height: "100%", ...props.style }}
    />
  ) : (
    <DiamondIconEmpty
      {...props}
      style={{ width: "100%", height: "100%", ...props.style }}
    />
  );
