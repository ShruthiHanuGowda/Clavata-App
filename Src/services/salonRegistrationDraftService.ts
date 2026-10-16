
import {
  ApolloClient,
  NormalizedCacheObject,
} from '@apollo/client';

import {
  SAVE_SALON_REGISTRATION_DRAFT,
} from '../graphql/queries';

type SaveDraftParams = {
  userId: string;
  currentStep: number;
  completedSteps: number[];
  formData: Record<string, unknown>;
};

export async function saveSalonDraft(
  client: ApolloClient<NormalizedCacheObject>,
  params: SaveDraftParams,
) {
  const result = await client.mutate({
    mutation: SAVE_SALON_REGISTRATION_DRAFT,
    variables: {
      input: {
        userId: params.userId,
        currentStep: params.currentStep,
        completedSteps: params.completedSteps,
        draftData: JSON.stringify(params.formData),
      },
    },
    fetchPolicy: 'no-cache',
  });

  const response =
    result.data?.saveSalonRegistrationDraft;

  if (!response?.success) {
    throw new Error(
      response?.message ||
        'Unable to save registration progress.',
    );
  }

  return response.draft;
}
