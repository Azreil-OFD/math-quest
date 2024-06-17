<template>
  <Toast />
  <Splitter style="height:80vh" class="mb-5">
    <SplitterPanel class="flex align-items-center justify-content-center" :size="30" :minSize="30" style="padding: 2vh;">
      <div class="list" style="width: 100%; max-height: 90vh; overflow: scroll; display: flex; flex-direction: column;">
        <button class="button" v-for="item in questionList"
          :style="'border: 1px solid gray; margin-top: 1vh; padding: 1vh;'" :class="{ active: item.id === selectID }"
          @click="selectID = item.id">
          {{ item.title.length ? item.title : 'Не задано' }}
        </button>
      </div>
      <button class="button" style="position: absolute; bottom: 2vh;" @click="createQuest">Добавить вопрос</button>
    </SplitterPanel>
    <SplitterPanel class="flex align-items-center justify-content-center" style="padding: 4vh; overflow: scroll; "
      v-if="selectID !== ''" >
      <editor-content class="question" :editor="question" />
      <div class="btn-box">
        <button type="button" class="button" @click="addEditor">Добавить ответ</button>
        <button type="button" class="button" @click="save">Сохранить</button>
      </div>
      <div class="grid-container">
        <div v-if="!answers.length">Вариантов ответа нет</div>
        <div class="grid-item" v-for="item in answers">
          <div class="item-top">
            <div class="flex align-items-center">
              <Checkbox :binary="true" v-model="item.success" />
              <label for="ingredient1" class="ml-2"> Верный ответ</label>
            </div>
            <button type="button" class="button" @click="remove(item)">Удалить</button>
          </div>
          <editor-content :editor="item.editor" />
        </div>
      </div>
    </SplitterPanel>
  </Splitter>
</template>

<script lang="ts" setup>
import { v4 as uuidv4 } from 'uuid';
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Mathematics } from '@tiptap-pro/extension-mathematics'
import Placeholder from '@tiptap/extension-placeholder'
import 'katex/dist/katex.min.css'
const toast = useToast();

const placeholderQuestion = Placeholder.configure({
  emptyEditorClass: 'is-editor-empty',
  placeholder: 'Введите текст вопроса...',
})
const placeholderAnswer = Placeholder.configure({
  emptyEditorClass: 'is-editor-empty',
  placeholder: 'Введите текст ответа...',
})

const questionList = ref<Questions[]>([])
const selectID = ref("")
const question = ref<Editor>()
const answers = ref<{ id: number, editor: Editor, success: boolean }[]>([]);

watch(selectID, () => {
  const value = questionList.value?.find(e => e.id === selectID.value)
  if (value) {
    question.value?.destroy()
    question.value = new Editor({
      extensions: [
        StarterKit,
        Mathematics,
        placeholderQuestion
      ],
      content: value.title,
    })
    answers.value.forEach(element => {
      element.editor.destroy()
    });
    answers.value = []

    value.quests.forEach(e => {
      const newEditor = new Editor({
        extensions: [
          StarterKit,
          Mathematics,
          placeholderAnswer
        ],
        content: e.text,
      });
      answers.value.push({ id: answers.value.length, editor: newEditor, success: e.success });
    })
  }
})

function createQuest() {
  questionList.value?.push({
    id: uuidv4(),
    title: '',
    quests: []
  })
  console.log(questionList.value)
}

function save() {
  const value = questionList.value?.find(e => e.id === selectID.value)
  const index = questionList.value.indexOf(value)
  if (question.value?.getText()) {
    let countSuccess = 0;
    let textSuccess = 0;
    if(answers.value?.length) {
      const object: Questions = {
      title: question.value?.getText(),
      quests: []
    }
    for (const key in answers.value) {
      if (Object.prototype.hasOwnProperty.call(answers.value, key)) {
        const element = answers.value[key];
        if (element.editor?.getText()) {
          if(element.success) {
            countSuccess += 1
          }
          if(element.editor.getText()) {
            textSuccess += 1
          }
          object.quests.push({
            text: element.editor.getText(),
            success: element.success
          })
        }
      }
    }
    if(textSuccess === 0) {
    console.log(textSuccess)
      toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Добавьте вариатны ответа!', life: 3000 });
      return
    } 
    if(countSuccess) {
      questionList.value[index].quests = object.quests
      questionList.value[index].title = object.title
    } else {
      toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Выберите хоть один праильный ответ !', life: 3000 });
    }
    } else {
      toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Добавьте вариатны ответа!', life: 3000 });
    }
  } else {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Заполните поле с вопросом!', life: 3000 });
  }

}

function remove(item: { id: number, editor: Editor, success: boolean }) {
  item.editor.destroy()
  const index = answers.value.indexOf(item)
  if (index > -1) {
    answers.value.splice(index, 1);
  }
}

function addEditor() {
  const newEditor = new Editor({
    extensions: [
      StarterKit,
      Mathematics,
      placeholderAnswer
    ],
    content: "",
  });
  answers.value.push({ id: answers.value.length, editor: newEditor, success: false });
}


onMounted(() => {
  question.value = new Editor({
    extensions: [
      StarterKit,
      Mathematics,
      placeholderQuestion
    ],
    content: "",
  })
})
onBeforeUnmount(() => {
  question.value?.destroy()
  answers.value?.forEach(subArray => {
    subArray.editor.destroy();
  });

})
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
  overflow: scroll;
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
  width: 100%;
  margin: 0 0.5vh;
}

.answer-row {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-evenly
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

  >*+* {
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
}

.grid-container {
  margin-top: 2vh;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  /* Two columns of equal width */
  gap: 10px;
  /* Gap between items */
}

.grid-item {
  padding: 10px;
  border: 1px solid #ccc;
  /* Just for visualization */
}

.button {
  background-color: #fff;
  /* белый фон кнопки */
  color: #000;
  /* черный текст */
  border: 2px solid #000;
  /* черная граница */
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  outline: none;
}

.button:hover {
  background-color: #000;
  /* черный фон при наведении */
  color: #fff;
  /* белый текст при наведении */
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