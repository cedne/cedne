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
import type {
  Member as OriginalMember,
  Project as OriginalProject,
} from "@prisma/client";
import { useRouter } from "next/navigation";

interface Record {
  type?: "member" | "project" | "language";
  name?: string;
  description?: string;
  locale?: string;
  token?: string;
  image?: File;
}

type Member = Omit<OriginalMember, "image">;
type Project = Omit<OriginalProject, "image">;

export default function CreateRecordClient({
  locales,
  projects,
  members,
}: {
  locales: string[];
  projects: Project[];
  members: Member[];
}) {
  const [state, updateState] = useReducer(
    (state: Record, newState: Record) => ({ ...state, ...newState }),
    {
      type: "member",
    }
  );
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const radios: {
    id: string;
    label: string;
  }[] = [
    {
      id: "member",
      label: "Участник",
    },
    // {
    //   id: "project",
    //   label: "Проект",
    // },
    // {
    //   id: "language",
    //   label: "Язык",
    // },
  ];
  const router = useRouter();

  useEffect(() => {
    if (!error) return;

    setTimeout(() => setError(""), 5000);
  }, [error]);

  useEffect(() => {
    if (!okMsg) return;

    setTimeout(() => setOkMsg(""), 5000);
  });

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
            .then((result: any) => {
              formData.delete("image");
              if (result === "data:") result = "";
              formData.append("image", result);
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
                  if (res.status === 200) {
                    router.refresh();
                    setOkMsg(res.statusText);
                  } else throw new Error(res.statusText);
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
          {radios.map(({ id, label }) => (
            <div key={id} className="flex flex-row space-x-2">
              <RadioGroupItem value={id} id={id} />
              <Label htmlFor={id}>{label}</Label>
            </div>
          ))}
        </RadioGroup>

        {(state.type === "member" || state.type === "project") && (
          <MainForm
            locales={locales}
            projectsOrMembers={state.type === "member" ? members : projects}
          />
        )}
        {state.type === "language" && <LocaleForm />}
        <Button type="submit" className="w-full">
          Создать
        </Button>
        {error && <p className="text-red-500">{error}</p>}
        {okMsg && <p className="text-green-500">{okMsg}</p>}
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

function MainForm({
  locales,
  projectsOrMembers,
}: {
  locales: string[];
  projectsOrMembers?: Project[] | Member[];
}) {
  const [selectedProjectOrMember, setSelectedProjectOrMember] = useState<
    Project | Member | undefined
  >();
  const [selectedLocale, setSelectedLocale] = useState<string>(locales[0]);

  useEffect(() => {
    if (!selectedProjectOrMember) {
      setSelectedLocale(locales[0]);
      return;
    }

    setSelectedLocale(selectedProjectOrMember.locale);
  }, [selectedProjectOrMember]);

  projectsOrMembers = [
    { id: "", name: "Новая запись", description: "", locale: locales[0] },
    ...(projectsOrMembers || []),
  ];

  return (
    <>
      <Select
        value={selectedProjectOrMember?.id}
        name="id"
        onValueChange={(value) => {
          const selected = projectsOrMembers?.find(
            (projectOrMember) => projectOrMember.id === value
          );
          setSelectedProjectOrMember(selected);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Выберите запись" />
        </SelectTrigger>
        <SelectContent>
          {projectsOrMembers?.map((projectOrMember) => (
            <SelectItem key={projectOrMember.id} value={projectOrMember.id}>
              {projectOrMember.id === ""
                ? projectOrMember.name
                : `${projectOrMember.name} (${projectOrMember.locale})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedLocale}
        name="locale"
        onValueChange={setSelectedLocale}
      >
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
      <LabelInput
        id="name"
        placeholder="Имя"
        defaultValue={
          !selectedProjectOrMember?.id ? "" : selectedProjectOrMember?.name
        }
      />
      <LabelInput
        id="description"
        placeholder="Описание"
        defaultValue={
          !selectedProjectOrMember?.id
            ? ""
            : selectedProjectOrMember?.description
        }
      />
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
