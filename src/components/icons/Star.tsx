import StarIcon from "./svg/pixel-star.svg";
import StarIconEmpty from "./svg/pixel-star-empty.svg";

export const Star = (
  {filled = true, ...props}: React.SVGProps<SVGSVGElement> & { filled?: boolean },
) =>
  filled ? (
    <StarIcon
      {...props}
      style={{ width: "100%", height: "100%", ...props.style }}
    />
  ) : (
    <StarIconEmpty
      {...props}
      style={{ width: "100%", height: "100%", ...props.style }}
    />
  );
