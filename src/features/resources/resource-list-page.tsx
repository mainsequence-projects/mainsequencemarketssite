import { ResourceListPage as CommandCenterResourceListPage } from "@dev-mainsequence/command-center-sdk/views";
import { useMemo, useState } from "react";

import { OperationDialog } from "@/components/operation-dialog";
import {
  createMarketsResourceApplication,
} from "@/features/resources/resource-adapter";
import type { MutationDefinition, ResourceDefinition } from "@/features/resources/resource-definitions";
import { useRouter } from "@/app/router";

type OpenMutation = { definition: MutationDefinition; initialValue?: unknown } | null;

export function ResourceListPage({
  definition,
  embedded = false,
}: {
  definition: ResourceDefinition;
  embedded?: boolean;
}) {
  const { navigate } = useRouter();
  const [mutation, setMutation] = useState<OpenMutation>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const application = useMemo(
    () => createMarketsResourceApplication(definition),
    [definition],
  );
  const navigation = useMemo(() => ({
    open: (intent: { resource: string; uid: string | number }) => {
      if (intent.resource !== definition.id) return;
      navigate(`${definition.listRoute}/${encodeURIComponent(String(intent.uid))}`);
    },
  }), [definition.id, definition.listRoute, navigate]);
  const primaryActions = useMemo(() => definition.create ? [{
    id: definition.create.operationId,
    label: definition.create.label,
    tone: "primary" as const,
    onSelect: () => setMutation({
      definition: definition.create!,
      initialValue: definition.create!.template,
    }),
  }] : [], [definition.create]);

  async function runMutation(openMutation: NonNullable<OpenMutation>, body: unknown) {
    if (openMutation.definition !== definition.create || !application.adapter.create) {
      throw new Error("The selected create action is not available through the resource adapter.");
    }
    await application.adapter.create(body);
    setRefreshKey((value) => value + 1);
  }

  const Container = embedded ? "section" : "main";
  return (
    <Container className={embedded ? "embedded-resource-list" : "content"} id={embedded ? undefined : "main-content"}>
      <CommandCenterResourceListPage
        key={definition.id}
        definition={application}
        embedded={embedded}
        navigation={navigation}
        pageSize={25}
        primaryActions={primaryActions}
        refreshable
        refreshKey={refreshKey}
        searchable={definition.searchable !== false}
        searchPlaceholder={`Search ${definition.title.toLowerCase()}`}
      />

      {mutation ? (
        <OperationDialog
          open
          title={mutation.definition.label}
          description={mutation.definition.description}
          operationId={mutation.definition.operationId}
          initialValue={mutation.initialValue}
          destructive={mutation.definition.destructive}
          onClose={() => setMutation(null)}
          onSubmit={(body) => runMutation(mutation, body)}
        />
      ) : null}
    </Container>
  );
}
