1. The workaround for supporting Slate
2. How does it know where in the text to inset the key when injected. What if its in the middle of a string?

To do in future

1. Have running integration tests for when a user changes their form. it could break
2. If complexity for dropdown increases. Upgrade to Preact + Shadowdom. This way we can have more complex functionality, whilst having a very small bundle size and also providing. Preact is 3KB, more than 1/10th smaller

New Product

1. An Brand aware agent. Use Wispr flow to speak about what the deliverables are, it uses the brand RAG to ask clarifiying questions and then creates the prompts with the tags.
2. For good DOM navigation models, maybe I'd look at Amazon AGI labs, I remember they were creating models just for DOM traversal or something

Design Choices

- no react for content
- custom grid. Could use a MUI table or / ANT table. It will add bloat. Its more of a list than a table
- Using a trie. If you have more than 1000k then a trie could work. But for anything less, its not needed
- Better optimisation. put everything to lowercase first, use a binary search over sorted keys
-

1. No React because thisis a content overlay tool. This entire project is less than React + ReactDOM
2. You dont want to inject your own React into another DOM. It could also have React, and maybe in another version. Do not want to complete the the hosts renderer
3. The dropdown.ts component is 60 lines. If I were to use react, I would need JSX, a root, hooks, states to handle 5 different variables. The innterHTML template is extremely lightweight
