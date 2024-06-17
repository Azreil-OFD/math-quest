<template>
  <div ref="testObj">
    <h1>{{ test.title }}</h1>
    <div v-for="(quest, index) in test.quests" :key="index" class="question">
      <p>{{ quest.text }}</p>
      <div v-for="(option, idx) in shuffledOptions" :key="idx" class="option">
        <label>
          <input
            type="radio"
            :name="'question-' + index"
            :value="option.text"
          />
          {{ option.text }}
        </label>
      </div>
    </div>
  </div>
  <button @click="printPage">Print</button>
</template>

<script setup>
const testObj = ref();
const test = ref({
  id: "2d955479-c7ff-491b-9671-3dd7ce1449f8",
  title: "fasdfasdf",
  quests: [
    {
      text: "fasdfasdf",
      success: false,
    },
    {
      text: "asfasf",
      success: false,
    },
    {
      text: "$1 + 1^2 + sqrt(x)$",
      success: true,
    },
    {
      text: "fasdfas",
      success: false,
    },
  ],
});

// Shuffling function to randomize options
const shuffledOptions = computed(() => {
  return test.value.quests.sort(() => Math.random() - 0.5);
});

// Function to print the page
const printPage = () => {
  const printContents = testObj.value.innerHTML;
  console.log(printContents);

  const printWindow = window.open("", "_blank");
  printWindow.document.open();
  printWindow.document.write(`
        <html>
          <head>
            <title>Print</title>
            <style>
              /* Add any styles you want to apply to the printed content */
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
              }
            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `);
  printWindow.document.close();
  printWindow.print();
  printWindow.close();
};
</script>

<style>
.question {
  margin-bottom: 20px;
}

.option {
  margin-left: 20px;
}
</style>
