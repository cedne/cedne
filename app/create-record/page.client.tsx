"use client";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useReducer, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Record {
  type?: "member" | "project" | "language";
  name?: string;
  description?: string;
  locale?: string;
  token?: string;
  image?: File;
}

export default function CreateRecordClient({ locales }: { locales: string[] }) {
  const [state, updateState] = useReducer(
    (state: Record, newState: Record) => ({ ...state, ...newState }),
    {
      type: "member",
    }
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!error) return;

    setTimeout(() => setError(""), 5000);
  }, [error]);

  return (
    <main className="mx-auto grid grid-flow-row gap-8 container">
      <h1 className="text-3xl font-bold text-center">Создать запись</h1>

      <form
        className="flex flex-col space-y-4"
        action="/api/v1/records"
        method="POST"
        encType="multipart/form-data"
        onSubmit={(e) => {
          e.preventDefault();

          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          const imageFile = formData.get("image") as File;
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
          })
            .then((result) => {
              formData.delete("image");
              formData.append("image", result as string);
            })
            .catch(() => {
              setError("Ошибка при загрузке изображения");
            })
            .finally(() => {
              fetch(form.action, {
                method: form.method,
                body: JSON.stringify(Object.fromEntries(formData)),
              })
                .then((res) => {
                  if (res.ok) form.reset();
                })
                .catch((error) => setError(error.message));
            });
        }}
      >
        <LabelInput
          id="token"
          placeholder="Токен"
          value={state.token}
          onChange={(e) => updateState({ token: e.target.value })}
        />

        <RadioGroup
          className="flex flex-row space-x-4"
          defaultChecked={true}
          defaultValue={state.type}
          onValueChange={(value) =>
            updateState({ type: value as Record["type"] })
          }
          id="type"
          name="type"
        >
          <div className="flex flex-row space-x-2">
            <RadioGroupItem value="member" id="member" />
            <Label htmlFor="member">Участник</Label>
          </div>
          {/* <div className="flex flex-row space-x-2">
            <RadioGroupItem value="project" id="project" />
            <Label htmlFor="project">Проект</Label>
          </div>
          <div className="flex flex-row space-x-2">
            <RadioGroupItem value="language" id="language" />
            <Label htmlFor="language">Язык</Label>
          </div> */}
        </RadioGroup>

        {(state.type === "member" || state.type === "project") && (
          <MainForm locales={locales} />
        )}
        {state.type === "language" && <LocaleForm />}
        {error && <p className="text-red-500">{error}</p>}
        <Button type="submit" className="w-full">
          Создать
        </Button>
      </form>
    </main>
  );
}

function LabelInput({
  id,
  placeholder,
  defaultValue = "",
  type = "text",
  accept,
  onChange,
  value,
}: {
  id: string;
  placeholder: string;
  defaultValue?: string;
  type?: React.HTMLInputTypeAttribute;
  accept?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  value?: string;
}) {
  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor={id}>{placeholder}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        accept={accept}
        onChange={onChange}
        value={value}
      />
    </div>
  );
}

function MainForm({ locales }: { locales: string[] }) {
  return (
    <>
      <Select defaultValue={locales[0]} name="locale">
        <SelectTrigger>
          <SelectValue placeholder="Выберите локаль" />
        </SelectTrigger>
        <SelectContent>
          {locales.map((locale) => (
            <SelectItem key={locale} value={locale}>
              {locale}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <LabelInput id="name" placeholder="Имя" />
      <LabelInput id="description" placeholder="Описание" />
      <LabelInput
        id="image"
        placeholder="Изображение"
        type="file"
        accept="image/*"
      />
    </>
  );
}

function LocaleForm() {
  return <LabelInput id="locale" placeholder="Локаль" />;
}
