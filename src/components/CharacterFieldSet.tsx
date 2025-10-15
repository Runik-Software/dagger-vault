import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel, FieldSet } from "./ui/field";

type PairField<TForm extends FieldValues> = {
  name: FieldPath<TForm>;
  label: string;
  className?: string;
};

type CharacterFieldSetProps<TForm extends FieldValues> = {
  control: Control<TForm>;
  pair?: [PairField<TForm>, PairField<TForm>];
  group?: Array<PairField<TForm>>;
  gridClassName?: string;
};

/**
 * Reusable field set for rendering either a pair (two-column) or a group (multi-column)
 * of numeric inputs that map to nested form fields. The component uses `Controller`
 * from react-hook-form and keeps types generic over the form shape.
 */
export function CharacterFieldSet<TForm extends FieldValues>({
  control,
  pair,
  group,
  gridClassName,
}: CharacterFieldSetProps<TForm>) {
  if (pair) {
    const [a, b] = pair;
    return (
      <FieldSet className={gridClassName ?? "grid grid-cols-2 gap-4"}>
        <Controller
          name={a.name}
          control={control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className={a.className ?? "space-y-2"}
            >
              <FieldLabel>{a.label}</FieldLabel>
              <Input
                {...field}
                onChange={(e) => {
                  const num = Number(e.target.value);
                  if (e.target.value === "" || Number.isNaN(num)) {
                    return field.onChange("");
                  }
                  return field.onChange(Number(e.target.value));
                }}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name={b.name}
          control={control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className={b.className ?? "space-y-2"}
            >
              <FieldLabel>{b.label}</FieldLabel>
              <Input
                {...field}
                onChange={(e) => {
                  const num = Number(e.target.value);
                  if (e.target.value === "" || Number.isNaN(num)) {
                    return field.onChange("");
                  }
                  return field.onChange(Number(e.target.value));
                }}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldSet>
    );
  }

  if (group) {
    return (
      <FieldSet className={gridClassName ?? "space-y-2"}>
        <div
          className={`grid ${group.length === 3 ? "grid-cols-3" : "grid-cols-2"} gap-2`}
        >
          {group.map((g) => (
            <Controller
              key={String(g.name)}
              name={g.name}
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className={g.className ?? "space-y-1"}
                >
                  <FieldLabel>{g.label}</FieldLabel>
                  <Input
                    {...field}
                    onChange={(e) => {
                      const num = Number(e.target.value);
                      if (e.target.value === "" || Number.isNaN(num)) {
                        return field.onChange("");
                      }
                      return field.onChange(Number(e.target.value));
                    }}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          ))}
        </div>
      </FieldSet>
    );
  }

  return null;
}

export default CharacterFieldSet;
