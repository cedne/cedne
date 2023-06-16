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
  type: "member" | "project" | "language";
  name: string;
  description: string;
  locale: string;
  token: string;
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
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const router = useRouter();
  const [selectedProjectOrMember, setSelectedProjectOrMember] = useState<
    Project | Member | undefined
  >();
  const [state, updateState] = useReducer(
    (state: Record, newState: Partial<Record>) => ({ ...state, ...newState }),
    { type: "member", name: "", description: "", locale: locales[0], token: "" }
  );
  const radios: {
    id: string;
    label: string;
  }[] = [
    { id: "member", label: "Участник" },
    { id: "project", label: "Проект" },
    // { id: "language", label: "Язык" },
  ];

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
                  res
                    .json()
                    .then((data) => {
                      if (res.status === 200) {
                        router.refresh();
                        setOkMsg(data.message);
                      } else throw new Error(data.message);
                    })
                    .catch((error) => setError(error.message));
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
          value={state.type}
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
            selectedProjectOrMember={selectedProjectOrMember}
            setSelectedProjectOrMember={setSelectedProjectOrMember}
          />
        )}
        {state.type === "language" && <LocaleForm />}
        <div className="grid grid-flow-col gap-4">
          <Button type="submit">
            {selectedProjectOrMember ? "Сохранить" : "Создать"}
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (!selectedProjectOrMember) return;

              fetch("/api/v1/records", {
                method: "DELETE",
                headers: {
                  id: selectedProjectOrMember.id,
                  type: state.type,
                },
              })
                .then((res) => {
                  res
                    .json()
                    .then((data) => {
                      if (res.status === 200) {
                        router.refresh();
                        setOkMsg(data.message);
                      } else throw new Error(data.message);
                    })
                    .catch((error) => setError(error.message));
                })
                .catch((error) => setError(error.message));
            }}
            className={`bg-red-500 hover:bg-red-600 ${
              selectedProjectOrMember && selectedProjectOrMember.id !== ""
                ? ""
                : "hidden"
            }`}
          >
            Удалить
          </Button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {okMsg && <p className="text-green-500">{okMsg}</p>}
      </form>
    </main>
  );
}

function LabelInput({
  id,
  placeholder,
  type = "text",
  ...props
}: {
  id: string;
} & React.ComponentPropsWithoutRef<typeof Input>) {
  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor={id}>{placeholder}</Label>
      <Input
        {...props}
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
      />
    </div>
  );
}

function MainForm({
  locales,
  projectsOrMembers,
  selectedProjectOrMember,
  setSelectedProjectOrMember,
}: {
  locales: string[];
  projectsOrMembers?: Project[] | Member[];
  selectedProjectOrMember: Project | Member | undefined;
  setSelectedProjectOrMember: React.Dispatch<
    React.SetStateAction<Project | Member | undefined>
  >;
  onCreate?: (projectOrMember: Project | Member | undefined) => void;
  onDelete?: (projectOrMember: Project | Member | undefined) => void;
}) {
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
