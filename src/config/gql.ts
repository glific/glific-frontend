import { gql as apolloGql } from '@apollo/client';
import type { TypedDocumentNode } from '@apollo/client';

// None of this codebase's GraphQL documents are defined with codegen-generated
// TypedDocumentNode<TData, TVariables> types, so Apollo Client 4's stricter default
// generics (which infer TData from the document type, falling back to `unknown`/`{}`
// for a plain untyped DocumentNode) collapse every useQuery/useMutation/useLazyQuery
// result's `data` to an empty type. This wrapper restores the 3.x-era behavior (implicit
// `any`) by typing every document as TypedDocumentNode<any, any> at the source.
export const gql = apolloGql as unknown as (
  strings: TemplateStringsArray,
  ...values: any[]
) => TypedDocumentNode<any, any>;

export default gql;
