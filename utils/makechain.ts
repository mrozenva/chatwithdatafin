import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';

const CONDENSE_PROMPT = `You are a repeating program, your only job is to repeat the question verbatim given to you. You always ignore chat history. Below are examples:

Question: What is my dogs name?

Answer: What is my dogs name?

Question: What day of the week is it?

Answer: What day of the week is it?

Input: {question}

`;

// change to your own 'system' prompt
const QA_PROMPT = `You are an expert Legal Advisor. You are qualified and adept at seeing Contracts/Agreements and pulling key information out of them. Use the following pieces of context to answer the question at the end.
If you are being asked for specific langauge related to the contract, you need to pull the language verbatim. You can provide a summary within the first sentece, but when addressing certain sections pull the language as its stated in the contract.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

{context}

Question: {question}
Helpful answer in markdown:`;

export const makeChain = (vectorstore: PineconeStore, openaiApiKey: string) => {
  const model = new OpenAI({
    temperature: 0, // increase temepreature to get more creative answers
    modelName: 'gpt-4',
    openAIApiKey: openaiApiKey, 
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(),
    {
      qaTemplate: QA_PROMPT,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      returnSourceDocuments: true, //The number of source documents returned is 4 by default
    },
  );

  return chain;
};
