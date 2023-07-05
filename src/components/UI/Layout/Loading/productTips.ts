type FlowTip = string;

const productTips: FlowTip[] = [
  'Always ensure you have "Published" the flow before testing it.',
  'Do not forget to add labels in the flow wherever you want the data to get captured.',
  'Make sure your flows are small (modular) and linked with each other.',
  'Flows can become harder to maintain (modify), Debug when they become very large.',
  'Take every opportunity to split a long conversation into 2-3 shorter logical segments.',
  'Make a flow for each logical segment.',
  'When getting user response from buttons and lists, prepare for additional cases',
  "Don't use shortened URLs in template approvals.",
  'If applying for an image template, make sure the attached media file has a message in the same language.',
  'When using button template always avoid flow keywords as buttons',
  "Make use of flows like 'Enter another flow' to keep the flows shorter for bringing in modularity",
  'While naming the variables, make sure that the name is related to the value it is going to hold.',
  "Don't use personal names, generic names like test while naming variables.",
];

export default productTips;