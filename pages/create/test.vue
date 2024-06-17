<template>
  <Toast />
  Название теста
  <InputText type="text" style="width: 70%" v-model="titleTest" />
  <Splitter style="height: 80vh; margin-top: 10px" class="mb-5">
    <SplitterPanel
      class="flex align-items-center justify-content-center"
      :size="30"
      :minSize="30"
      style="padding: 2vh"
    >
      <div
        class="list"
        style="
          width: 100%;
          max-height: 100%;
          overflow-y: scroll;
          display: flex;
          flex-direction: column;
        "
      >
        <button
          class="button"
          v-for="item in questionList"
          :key="item.id"
          :class="{ active: item.id === selectID }"
          @click="selectID = item.id"
          :style="'border: 1px solid gray; margin-top: 1vh; padding: 0.5vh;'"
        >
          <div v-html="item.title.length ? renderMath(item.title) : 'Не задано'">
          </div>
        </button>
      </div>
    </SplitterPanel>
    <SplitterPanel
      class="flex align-items-center justify-content-center"
      style="padding: 4vh; overflow-y: scroll"
      v-if="selectID !== ''"
    >
      <editor-content class="question" :editor="question" />
      <div class="btn-box">
        <button type="button" class="button" @click="addEditor">
          Добавить ответ
        </button>
        <button type="button" class="button" @click="save">Сохранить</button>
      </div>
      <div class="grid-container">
        <div v-if="!answers.length">Вариантов ответа нет</div>
        <div class="grid-item" v-for="item in answers" :key="item.id">
          <div class="item-top">
            <div class="flex align-items-center">
              <Checkbox :binary="true" v-model="item.success" />
              <label for="ingredient1" class="ml-2"> Верный ответ</label>
            </div>
            <button type="button" class="button" @click="remove(item)">
              Удалить
            </button>
          </div>
          <editor-content :editor="item.editor" />
        </div>
      </div>
    </SplitterPanel>
  </Splitter>
  <div class="button-box">
    <button class="button" @click="createQuest">Добавить вопрос</button>
    <button class="button" @click="saveTest">Сохранить тест</button>
  </div>
</template>

<script lang="ts" setup>
import { v4 as uuidv4 } from "uuid";
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { Mathematics } from "@tiptap-pro/extension-mathematics";
import Placeholder from "@tiptap/extension-placeholder";
import "katex/dist/katex.min.css";
import katex from 'katex';

const titleTest = ref("");
const toast = useToast();
function renderMath(inputText: string): string {
  // Regular expression to match text within $
  const regex = /\$(.*?)\$/g;
  let match;
  let formattedText = inputText;
  const matches = [];

  // Find all matches
  while ((match = regex.exec(inputText)) !== null) {
    matches.push(match);
  }

  // Replace each match with rendered HTML
  matches.forEach(match => {
    const mathExpression = match[1];
    const renderedMath = katex.renderToString(mathExpression, {
      throwOnError: false
    });
    formattedText = formattedText.replace(`$${mathExpression}$`, renderedMath);
  });

  return formattedText;
}
const placeholderQuestion = Placeholder.configure({
  emptyEditorClass: "is-editor-empty",
  placeholder: "Введите текст вопроса...",
});
const placeholderAnswer = Placeholder.configure({
  emptyEditorClass: "is-editor-empty",
  placeholder: "Введите текст ответа...",
});

const questionList = ref<Questions[]>([]);
const selectID = ref("");
const question = ref<Editor>();
const answers = ref<{ id: number; editor: Editor; success: boolean }[]>([]);
const saveTest = () => {
  const filteredData = questionList.value
    .filter((item) => item.title && item.quests.length > 0)
    .map((e) => toRaw(e));
  if (titleTest.value.length === 0) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: "Добавьте название теста!",
      life: 3000,
    });
    return;
  }

  if (filteredData.length === 0) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: "Добавьте хотя бы один вопрос!",
      life: 3000,
    });
    return;
  }
  const quest = {
    title: titleTest.value,
    questions: filteredData,
  };
  console.log(quest);
  // Here you can add code to handle the saving process, like sending `filteredData` to an API or saving it locally.

  // Clear all questions and answers after saving
  questionList.value = [];
  selectID.value = "";
  question.value?.destroy();
  question.value = new Editor({
    extensions: [StarterKit, Mathematics, placeholderQuestion],
    content: "",
  });
  answers.value.forEach((element) => {
    element.editor.destroy();
  });
  answers.value = [];
  titleTest.value = "";
  toast.add({
    severity: "success",
    summary: "Успех",
    detail: "Тест успешно сохранен!",
    life: 3000,
  });
};
watch(selectID, () => {
  const value = questionList.value.find((e) => e.id === selectID.value);
  if (value) {
    question.value?.destroy();
    question.value = new Editor({
      extensions: [StarterKit, Mathematics, placeholderQuestion],
      content: value.title,
    });
    answers.value.forEach((element) => {
      element.editor.destroy();
    });
    answers.value = value.quests.map((e) => ({
      id: answers.value.length,
      editor: new Editor({
        extensions: [StarterKit, Mathematics, placeholderAnswer],
        content: e.text,
      }),
      success: e.success,
    }));
  }
});

function createQuest() {
  questionList.value.push({
    id: uuidv4(),
    title: "",
    quests: [],
  });
}

function save() {
  const value = questionList.value.find((e) => e.id === selectID.value);
  if (!value) return;

  const index = questionList.value.indexOf(value);
  if (question.value?.getHTML()) {
    let countSuccess = 0;
    let textSuccess = 0;

    const object: Questions = {
      title: question.value.getHTML(),
      quests: answers.value
        .filter((element) => element.editor.getText())
        .map((element) => {
          if (element.success) countSuccess += 1;
          textSuccess += 1;
          return {
            text: element.editor.getText(),
            success: element.success,
          };
        }),
    };

    if (textSuccess === 0) {
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Добавьте варианты ответа!",
        life: 3000,
      });
      return;
    }

    if (countSuccess) {
      questionList.value[index].quests = object.quests;
      questionList.value[index].title = object.title;
    } else {
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Выберите хотя бы один правильный ответ!",
        life: 3000,
      });
    }
  } else {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: "Заполните поле с вопросом!",
      life: 3000,
    });
  }
}

function remove(item: { id: number; editor: Editor; success: boolean }) {
  item.editor.destroy();
  const index = answers.value.indexOf(item);
  if (index > -1) {
    answers.value.splice(index, 1);
  }
}

function addEditor() {
  const newEditor = new Editor({
    extensions: [StarterKit, Mathematics, placeholderAnswer],
    content: "",
  });
  answers.value.push({
    id: answers.value.length,
    editor: newEditor,
    success: false,
  });
}

onMounted(() => {
  question.value = new Editor({
    extensions: [StarterKit, Mathematics, placeholderQuestion],
    content: "",
  });
});

onBeforeUnmount(() => {
  question.value?.destroy();
  answers.value.forEach((subArray) => {
    subArray.editor.destroy();
  });
});
</script>

<style lang="scss">
.split {
  display: flex;
  flex-direction: row;
  margin: 0;
  padding: 0;
}

.question .tiptap,
.grid-item .tiptap {
  max-height: 20vh;
  overflow-y: scroll;
}

.btn-box {
  display: flex;
  justify-content: space-evenly;
}

.item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-box .button {
  width: 90%;
  margin: 0 0.5vh;
}

.answer-row {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-evenly;
}

.tiptap p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  pointer-events: none;
}

.ProseMirror:focus {
  outline: none;
}
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }

  .Tiptap-mathematics-editor {
    background: #202020;
    color: #fff;
    font-family: monospace;
    padding: 0.2rem 0.5rem;
  }

  .Tiptap-mathematics-render {
    cursor: pointer;
    padding: 0 0.25rem;
    transition: background 0.2s;

    &:hover {
      background: #eee;
    }
  }

  .Tiptap-mathematics-editor,
  .Tiptap-mathematics-render {
    border-radius: 0.25rem;
    display: inline-block;
  }

  overflow-y: scroll;
  overflow-x: hidden;
}

.grid-container {
  margin-top: 2vh;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.grid-item {
  padding: 10px;
  border: 1px solid #ccc;
}

.button {
  background-color: #fff;
  color: #000;
  border: 2px solid #000;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  outline: none;
}
.list .button {
  width: 90%;
}

.button:hover {
  background-color: #000;
  color: #fff;
}

.active {
  background-color: #333;
  color: #fff;
}

.button:active {
  background-color: #333;
  color: #fff;
}
</style>
