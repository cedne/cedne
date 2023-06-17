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
import { Loader2 } from "lucide-react";
import { useAsync } from "@react-hookz/web";

interface Record {
  id: string;
  type: "member" | "project" | "language";
  name: string;
  description: string;
  locale: string;
  token: string;
  image?: File;
}

type Member = Omit<OriginalMember, "image">;
type Project = Omit<OriginalProject, "image">;

export default function CreateRecordClient() {
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [state, updateState] = useReducer(
    (state: Record, newState: Partial<Record>) => ({ ...state, ...newState }),
    {
      id: "",
      type: "member",
      name: "",
      description: "",
      locale: "ru",
      token: "",
    }
  );
  const radios: {
    id: string;
    label: string;
  }[] = [
    { id: "member", label: "Участник" },
    // { id: "project", label: "Проект" },
    // { id: "language", label: "Язык" },
  ];
  const [localesState, localesAction] = useAsync(
    (): Promise<string[]> =>
      fetch("/api/v1/locales").then((res) =>
        res
          .json()
          .then((data: { language: string }[]) =>
            data.map((locale) => locale.language)
          )
      ),
    []
  );
  const [projectsState, projectsAction] = useAsync(
    (): Promise<Project[]> =>
      fetch("/api/v1/projects").then((res) => res.json()),
    []
  );
  const [membersState, membersAction] = useAsync(
    (): Promise<Member[]> => fetch("/api/v1/members").then((res) => res.json()),
    []
  );

  useEffect(() => {
    localesAction.execute();
    membersAction.execute();
  }, []);

  useEffect(() => {
    if (!error) return;

    setTimeout(() => setError(""), 5000);
  }, [error]);

  useEffect(() => {
    if (!okMsg) return;

    setTimeout(() => setOkMsg(""), 5000);
  }, [okMsg]);

  function formSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    setLoading(true);

    new Promise((resolve, reject) => {
      const imageFile = state.image as File;
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    })
      .then((result: any) => {
        fetch(form.action, {
          method: form.method,
          body: JSON.stringify({ ...state, image: result }),
        })
          .then((res) => {
            res
              .json()
              .then((data) => {
                if (res.status === 200) {
                  form.reset();
                  router.refresh();
                  setOkMsg(data.message);
                } else throw new Error(data.message);
              })
              .catch((error) => setError(error.message));
          })
          .catch((error) => setError(error.message))
          .finally(() => setLoading(false));
      })
      .catch((e) => setError(`Ошибка при загрузке изображения ${e.message}`))
      .finally(() => setLoading(false));
  }

  function reset() {
    updateState({ name: "", description: "", image: undefined, id: "" });
    membersAction.reset();
    membersAction.execute();
  }

  function onDelete(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (!state.id) return;

    setLoading(true);

    fetch("/api/v1/records", {
      method: "DELETE",
      headers: {
        id: state.id,
        type: state.type,
      },
    })
      .then((res) => {
        res
          .json()
          .then((data) => {
            if (res.status === 200) {
              // @ts-ignore
              e.target.form.reset();
              router.refresh();
              setOkMsg(data.message);
            } else throw new Error(data.message);
          })
          .catch((error) => setError(error.message));
      })
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  }

  return (
    <main className="mx-auto grid grid-flow-row gap-8 container">
      <h1 className="text-3xl font-bold text-center">Создать запись</h1>

      <form
        className="flex flex-col space-y-4"
        action="/api/v1/records"
        method="POST"
        encType="multipart/form-data"
        onSubmit={formSubmit}
        onReset={reset}
        onChange={(e) => {
          // @ts-ignore
          if (!e.target.value && !state[e.target.name]) return;
          // @ts-ignore
          if (e.target.type === "file") {
            // @ts-ignore
            updateState({ image: e.target.files[0] });
            return;
          }
          // @ts-ignore
          updateState({ [e.target.name]: e.target.value });
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

        {(state.type === "member" || state.type === "project") &&
          // (
          //   <MainForm
          //     locales={localesState.result || []}
          //     projectsOrMembers={
          //       state.type === "member"
          //         ? membersState.result
          //         : projectsState.result
          //     }
          //     selectedProjectOrMember={selectedProjectOrMember}
          //     setSelectedProjectOrMember={setSelectedProjectOrMember}
          //   />
          // )

          // Is it possible to make ()=>{} function to be a component?
          // I mean, to be able to use it like <MainForm ... />

          (() => {
            const record = (
              <Select
                name="id"
                value={state.id}
                onValueChange={(value) => updateState({ id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Новая запись" />
                </SelectTrigger>
                <SelectContent>
                  {((records: Project[] | Member[]) => {
                    const newRecords: Project[] | Member[] = [
                      {
                        id: "",
                        name: "Новая запись",
                        locale: "",
                        description: "",
                      },
                      ...records,
                    ];

                    return newRecords.map((record) => (
                      <SelectItem key={record.id} value={record.id}>
                        {`${record.name} ${record.id && `(${record.locale})`}`}
                      </SelectItem>
                    ));
                  })(
                    state.type === "member"
                      ? membersState.result
                      : projectsState.result
                  )}
                </SelectContent>
              </Select>
            );
            const locale = (
              <Select
                name="locale"
                value={state.locale}
                onValueChange={(value) => updateState({ locale: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите локаль" />
                </SelectTrigger>
                <SelectContent>
                  {localesState.result.map((locale) => (
                    <SelectItem key={locale} value={locale}>
                      {locale}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
            const name = (
              <LabelInput
                id="name"
                placeholder={state.type === "member" ? "Имя" : "Название"}
              />
            );
            const description = (
              <LabelInput
                id="description"
                placeholder={state.type === "member" ? "Должность" : "Описание"}
              />
            );
            const image = (
              <LabelInput
                id="image"
                type="file"
                placeholder="Изображение"
                accept="image/*"
              />
            );

            return (
              <>
                {record}
                {locale}
                {name}
                {description}
                {image}
              </>
            );
          })()}

        {state.type === "language" && (
          <LabelInput id="locale" placeholder="Локаль" />
        )}

        <div className="grid grid-flow-col gap-4">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {state.id ? "Сохранить" : "Создать"}
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={onDelete}
            className={`bg-red-500 hover:bg-red-600 ${
              state.id !== "" ? "" : "hidden"
            }`}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
