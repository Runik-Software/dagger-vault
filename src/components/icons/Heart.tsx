import HeartIcon from "./svg/pixel-heart.svg";
import HeartIconEmpty from "./svg/pixel-heart-empty.svg";

export const Heart = (
  {filled = true, ...props}: React.SVGProps<SVGSVGElement> & { filled?: boolean },
) =>
  filled ? (
    <HeartIcon
      {...props}
      style={{ width: "100%", height: "100%", ...props.style }}
    />
  ) : (
    <HeartIconEmpty
      {...props}
      style={{ width: "100%", height: "100%", ...props.style }}
    />
  );
