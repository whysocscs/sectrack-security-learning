const awsShared = {
  label: 'AWS · Shared Responsibility Model',
  url: 'https://aws.amazon.com/compliance/shared-responsibility-model/',
  note: 'cloud 자체의 보안과 cloud 안 고객 구성·data·workload 보안을 구분하는 공급자 기준입니다.',
}

const awsIamEvaluation = {
  label: 'AWS IAM · Policy evaluation logic',
  url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html',
  note: 'authentication, request context, policy 조합, explicit deny 우선순위의 공식 설명입니다.',
}

const awsIamBest = {
  label: 'AWS IAM · Security best practices',
  url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html',
  note: 'temporary credentials, least privilege, condition, access review·validation의 공식 권고입니다.',
}

const azureClusterConnect = {
  label: 'Microsoft Learn · Cluster Connect architecture',
  url: 'https://learn.microsoft.com/en-us/azure/azure-arc/kubernetes/conceptual-cluster-connect',
  note: 'local proxy, Azure service, clusterconnect-agent, kube-aad-proxy, apiserver로 이어지는 현재 정상 흐름입니다.',
}

const azureIdentity = {
  label: 'Microsoft Learn · Azure Arc Kubernetes identity and access',
  url: 'https://learn.microsoft.com/en-us/azure/azure-arc/kubernetes/identity-access-overview',
  note: 'Microsoft Entra authentication과 Azure·Kubernetes RBAC authorization 선택을 구분합니다.',
}

const azureAgentUpgrade = {
  label: 'Microsoft Learn · Upgrade Azure Arc agents',
  url: 'https://learn.microsoft.com/en-us/azure/azure-arc/kubernetes/agent-upgrade',
  note: 'default auto-upgrade, manual upgrade, effective agent version 확인의 공식 운영 절차입니다.',
}

const msrcAzureArc = {
  label: 'Microsoft MSRC · CVE-2022-37968',
  url: 'https://msrc.microsoft.com/update-guide/vulnerability/CVE-2022-37968',
  note: 'Cluster Connect의 unauthenticated elevation of privilege, 조건, fixed builds를 기록한 vendor advisory입니다.',
}

const msrcAzureArcCvrf = {
  label: 'Microsoft MSRC API · October 2022 CVRF',
  url: 'https://api.msrc.microsoft.com/cvrf/v3.0/cvrf/2022-Oct',
  note: 'CVE-2022-37968의 product IDs, CVSS, fixed builds, customer action을 machine-readable CVRF record로 제공합니다. 일반 브라우저는 XML을 표시할 수 있고 API의 JSON representation도 같은 record를 나타냅니다.',
}

const nvdAzureArc = {
  label: 'NVD · CVE-2022-37968',
  url: 'https://nvd.nist.gov/vuln/detail/CVE-2022-37968',
  note: '현재 CNA description, CVSS, affected-less-than version ranges, vendor references를 확인합니다.',
}

const cloudGoatRepo = {
  label: 'Rhino Security Labs · CloudGoat 공식 저장소',
  url: 'https://github.com/RhinoSecurityLabs/cloudgoat',
  note: '의도적으로 취약한 resource, production·sensitive resource 금지, 별도 생성 resource 정리 책임을 명시합니다.',
}

const sharedResponsibilityMechanism = {
  id: 'w15-shared-responsibility-mechanism',
  type: 'mechanism',
  title: '공유 책임은 자산·서비스·통제마다 구현자와 운영 증거의 소유자를 정하는 과정이다',
  situation: 'cloud provider가 physical infrastructure와 managed service를 운영해도 고객만 아는 data sensitivity, business users, workload configuration, access purpose까지 대신 결정할 수는 없습니다. 서비스별 책임과 증거 소유자를 명시해야 통제 공백을 찾을 수 있습니다.',
  terms: [
    { term: 'Cloud Provider · 공급자', meaning: 'data center, physical host, managed control plane 같은 계약된 cloud 기능을 운영하는 조직입니다.', contrast: '고객의 모든 identity·data·workload decision을 자동 책임지는 주체는 아닙니다.' },
    { term: 'Customer · 고객', meaning: 'cloud account·subscription에서 data, identity, workload, service setting을 선택·운영하는 조직입니다.', contrast: '개별 end user 한 명만이 아니라 자산 소유자·platform team·security team을 포함합니다.' },
    { term: 'Managed Service · 관리형 서비스', meaning: '공급자가 일부 software 설치·patch·availability를 운영하는 service 형태입니다.', contrast: '관리형이라는 말이 customer IAM·data classification·usage log 책임까지 없앤다는 뜻은 아닙니다.' },
    { term: 'Control Plane · 제어 영역', meaning: 'resource 생성, policy, identity, configuration을 관리하는 API와 상태입니다.', contrast: 'application request·business data가 흐르는 data plane과 구분합니다.' },
    { term: 'Control Owner · 통제 소유자', meaning: '통제를 설계·승인·운영하고 실패 때 조치할 책임이 있는 역할입니다.', contrast: '기능을 제공한 vendor와 고객 내부 evidence owner가 서로 다를 수 있습니다.' },
    { term: 'Evidence · 운영 근거', meaning: 'version, effective policy, log, alert, test result처럼 통제가 실제 작동함을 보여 주는 자료입니다.', contrast: '책임 표의 체크 표시만으로 현재 상태를 증명하지는 못합니다.' },
  ],
  stages: [
    { label: '자산·data 식별', actor: 'asset owner·data owner', input: 'service inventory, data class, business purpose, environment', action: '보호할 resource와 영향 범위를 구체적인 이름·owner로 나눕니다.', output: 'asset/data responsibility cards' },
    { label: 'service 경계 확인', actor: 'cloud architect·provider contract', input: 'service model, managed components, region·tenant boundary', action: '공급자가 운영하는 layer와 고객이 구성하는 layer를 확인합니다.', output: 'provider/customer/shared boundary' },
    { label: '통제 배정', actor: 'security·platform teams', input: 'patch, IAM, encryption, backup, logging requirements', action: '각 통제의 implementer, approver, operator, escalation owner를 지정합니다.', output: 'control ownership matrix' },
    { label: '구성 적용', actor: 'provider service·customer operator', input: 'vendor update와 approved customer settings', action: '각 owner가 맡은 patch·policy·data·monitoring control을 적용합니다.', output: 'effective versions and configurations' },
    { label: '증거 수집', actor: 'control owner·auditor', input: 'version, policy snapshot, logs, test result', action: '현재 시점과 scope가 있는 evidence를 responsibility row에 연결합니다.', output: 'verifiable control state' },
    { label: '공백·변경 검토', actor: 'risk owner', input: 'missing evidence, service change, residual risk', action: 'owner가 없거나 겹치는 통제를 보완하고 accepted risk와 next review를 기록합니다.', output: 'action owner, due date, residual risk' },
  ],
  trustBoundary: {
    before: '“cloud가 알아서 보호”라는 표현에는 어떤 자산·layer·설정·evidence인지 정보가 없습니다.',
    decision: '계약·공식 service 문서와 고객 architecture를 함께 아는 owner가 통제별 책임을 배정해야 합니다.',
    after: 'provider update와 customer IAM·data·log responsibility가 서로 다른 row와 evidence로 추적됩니다.',
    failure: '공급자 patch를 고객 최소 권한으로 대체하거나 반대로 customer configuration defect를 vendor 책임으로 넘기면 실제 통제 공백이 남습니다.',
  },
}

const responsibilityTrace = {
  id: 'w15-shared-responsibility-card-trace',
  type: 'code-trace',
  title: '합성 managed-store 자산의 책임과 evidence를 분리한 카드',
  evidenceKind: 'educational-model',
  language: 'yaml',
  description: '실제 cloud tenant가 아닌 fixed browser card입니다. provider 기능, customer 설정, 공동 검증을 서로 대체하지 않도록 표현합니다.',
  code: '1  asset: TRAINING-REPORT-STORE\n2  data_class: synthetic_internal\n3  provider: { control: physical_and_managed_service_patch, evidence: service_record }\n4  customer: { control: principals_policy_retention, evidence: policy_snapshot }\n5  shared: { control: encryption_feature_and_key_use, evidence: effective_config }\n6  normal_reader: { action: reports:GetObject, resource: reports/quarterly/* }\n7  denied_actions: [reports:DeleteObject, iam:ChangePolicy]\n8  log_fields: [time, principal_id, action, resource_id, decision, policy_version]\n9  missing_evidence: none_for_training_fixture\n10 claim_limit: no_live_account_no_provider_audit_conclusion',
  trace: [
    { lines: '1–2', before: 'service 이름만 있고 어떤 data·environment인지 모릅니다.', action: '합성 asset ID와 data class를 먼저 고정합니다.', after: '책임 질문이 특정 training asset 범위에 묶입니다.' },
    { lines: '3–5', before: 'provider, customer, shared 책임이 한 문장에 섞여 있습니다.', action: '통제와 evidence owner를 세 row로 분리합니다.', after: 'vendor patch evidence가 customer policy snapshot을 대신할 수 없음을 볼 수 있습니다.' },
    { lines: '6–7', before: 'reader 업무에 필요한 permission과 금지 action이 없습니다.', action: '정상 read scope와 delete·policy-change deny expectation을 기록합니다.', after: '최소 권한과 정상 업무 retest의 oracle이 생깁니다.' },
    { lines: '8–10', before: '결정 설명 log와 evidence limit이 빠져 있습니다.', action: '최소 audit fields와 live account·provider audit 결론 금지를 적습니다.', after: '합성 fixture보다 큰 운영 주장을 막고 필요한 추가 evidence를 알 수 있습니다.' },
  ],
}

const clusterConnectMechanism = {
  id: 'w15-shared-responsibility-cluster-connect-mechanism',
  type: 'mechanism',
  title: 'Cluster Connect는 Azure identity를 cluster API authorization까지 여러 경계로 전달한다',
  situation: '방화벽 inbound port를 열지 않고 원격 관리자가 Arc-enabled Kubernetes apiserver에 접근하려면 local proxy, Azure service, cluster agent, identity proxy, Kubernetes authorization이 같은 caller와 scope를 보존해야 합니다.',
  terms: [
    { term: 'Cluster Connect · 클러스터 연결', meaning: 'Azure Arc를 통해 Kubernetes apiserver에 관리 connection을 중계하는 기능입니다.', contrast: 'Kubernetes RBAC 자체나 cluster network 전체를 대체하는 하나의 권한 체계는 아닙니다.' },
    { term: 'Reverse Proxy Agent · 역방향 프록시 agent', meaning: 'cluster 안에서 Azure service로 outbound session을 시작해 inbound firewall port 없이 request를 받는 component입니다.', contrast: '인터넷 caller의 identity를 무조건 신뢰하는 tunnel이 아니어야 합니다.' },
    { term: 'Microsoft Entra Authentication · 인증', meaning: '호출 entity가 누구인지 token과 tenant context로 확인하는 단계입니다.', contrast: '인증 성공은 어떤 Kubernetes action도 허용한다는 authorization 결과가 아닙니다.' },
    { term: 'Impersonation · 가장', meaning: '검증된 external identity를 Kubernetes가 이해할 user·group context로 전달하는 mechanism입니다.', contrast: '검증되지 않은 caller를 cluster-admin으로 바꾸는 권한 상승을 뜻하지 않습니다.' },
    { term: 'RBAC Authorization · 인가', meaning: 'principal이 requested verb·resource·namespace를 수행할 수 있는지 role binding으로 판단합니다.', contrast: 'network 연결 성공이나 authentication과 별도 decision입니다.' },
    { term: 'Agent Version · 에이전트 버전', meaning: 'cluster에 배포된 Arc components의 release identity입니다.', contrast: 'CLI version이나 cloud service UI가 최신이라는 사실만으로 in-cluster agent patch를 증명하지 않습니다.' },
  ],
  stages: [
    { label: 'caller 준비', actor: 'authorized operator·Azure proxy client', input: 'Azure access token, Azure Resource Manager cluster ID, intended action', action: 'caller identity와 대상 Arc resource를 local proxy session에 연결합니다.', output: 'identity-bound local kubeconfig endpoint' },
    { label: 'Azure 중계', actor: 'local proxy·Azure Arc service', input: 'local Kubernetes request와 authenticated Azure context', action: '대상 cluster session을 찾고 request를 해당 outbound connection으로 전달합니다.', output: 'cluster-bound request context' },
    { label: 'cluster 수신', actor: '`clusterconnect-agent`', input: 'Azure service에서 온 session request', action: 'cluster 안의 identity·authorization path로 request를 전달합니다.', output: '`kube-aad-proxy`로 향하는 request' },
    { label: 'identity 확인', actor: '`kube-aad-proxy`·Microsoft Entra', input: 'caller token과 request context', action: 'calling entity를 authenticate하고 cluster에 넘길 identity를 만듭니다.', output: 'verified user·group context 또는 authentication deny' },
    { label: 'Kubernetes 인가', actor: 'apiserver·Azure RBAC 또는 Kubernetes RBAC', input: 'impersonated identity, verb, resource, namespace', action: 'effective role·binding·policy로 allow 또는 deny를 결정합니다.', output: 'authorized API result 또는 forbidden' },
    { label: '관찰·회수', actor: 'audit log·operator', input: 'identity, action, decision, agent version, session ID', action: '결정을 기록하고 session 종료·upgrade·incident response evidence로 연결합니다.', output: 'traceable access record and closed session' },
  ],
  trustBoundary: {
    before: '외부 caller가 endpoint를 알거나 network connection을 만들 수 있다는 사실은 verified identity나 cluster role이 아닙니다.',
    decision: 'Azure identity validation과 cluster authorization이 caller·resource context를 잃지 않고 각각 성공해야 합니다.',
    after: '허용된 principal만 지정 verb·resource에 도달하고 deny와 agent version이 audit evidence로 남습니다.',
    failure: 'CVE-2022-37968에서 공개적으로 검증된 효과는 unauthenticated user가 cluster-admin으로 권한 상승할 수 있었다는 것입니다. Microsoft는 어느 내부 함수·조건문이 잘못됐는지 source line을 공개하지 않았으므로 특정 component line을 원인으로 추정하지 않습니다.',
  },
}

const azureRemediationAnalysis = {
  id: 'w15-shared-responsibility-azure-remediation',
  type: 'patch-analysis',
  title: '공식 MSRC 수정 기록: 공개 source diff 대신 product별 fixed build를 검증한다',
  evidenceKind: 'official-remediation',
  source: msrcAzureArcCvrf,
  language: 'json',
  description: 'MSRC October 2022 CVRF의 동일 record를 `Accept: application/json`으로 요청한 JSON representation에서 CVE-2022-37968에 해당하는 실제 field만 발췌했습니다. 일반 브라우저는 기본 XML representation을 표시할 수 있습니다. `ProductStatuses.Type: 3`은 known affected product IDs를 가리키며, remediation objects가 security update의 `FixedBuild`를 제공합니다. 내부 source·diff는 공개되지 않았습니다.',
  before: {
    label: '공식 affected product status',
    code: '{\n  "ProductStatuses": [{\n    "ProductID": ["12092", "12091", "12089", "12090", "12093"],\n    "Type": 3\n  }]\n}',
  },
  after: {
    label: '공식 security-update fixed builds',
    code: '[\n  {"ProductID":["12089"],"SubType":"Security Update","FixedBuild":"1.5.8"},\n  {"ProductID":["12090"],"SubType":"Security Update","FixedBuild":"1.6.19"},\n  {"ProductID":["12091"],"SubType":"Security Update","FixedBuild":"1.7.18"},\n  {"ProductID":["12092"],"SubType":"Security Update","FixedBuild":"1.8.11"},\n  {"ProductID":["12093"],"SubType":"Security Update","FixedBuild":"2.2.2088.5593"}\n]',
  },
  changes: [
    'Azure Arc-enabled Kubernetes agent release line마다 1.5.8, 1.6.19, 1.7.18, 1.8.11 이상을 보호 build로 지정합니다. 1.8.14 사용자는 이미 보호된다고 MSRC FAQ가 설명합니다.',
    'auto-upgrade가 enabled인 고객은 자동으로 update되었고, 수동 제어 고객은 latest version으로 직접 upgrade해야 한다고 MSRC가 명시합니다.',
    'Azure Stack Edge는 2209 release, software version 2.2.2088.5593으로 update해야 합니다.',
    '수정 적용 evidence는 “update 명령을 실행함”이 아니라 각 cluster가 보고한 effective agent version과 auto-upgrade 상태입니다.',
    'Microsoft는 내부 source code, faulty function·line, change diff, vendor regression test name을 공개하지 않았으므로 이 화면은 그 내용을 만들어 내지 않습니다.',
  ],
  regressionTests: [
    { case: '공개 vendor test corpus 확인', expected: 'MSRC 공개 record에는 source-level regression test 이름·code가 없음', reason: '비공개 test를 실제 upstream test처럼 꾸미지 않기 위한 evidence boundary입니다.' },
    { case: 'Arc agent version threshold', expected: '각 installed release line이 1.5.8 / 1.6.19 / 1.7.18 / 1.8.11 이상으로 report', reason: 'official fixed build가 실제 in-cluster agent에 적용됐는지 확인합니다.' },
    { case: 'auto-upgrade effective state', expected: 'enabled 상태와 latest agent 관찰 또는 approved manual-upgrade record가 일치', reason: 'default 설정 추정이 아니라 effective configuration을 검증합니다.' },
    { case: 'unauthenticated negative authorization', expected: '격리된 vendor-approved staging에서 identity 없는 request는 cluster API 권한을 얻지 못하고 deny가 기록됨', reason: '공개된 failure effect인 unauthenticated privilege elevation이 사라졌는지 product owner가 검증할 oracle입니다.' },
    { case: 'authorized operator baseline', expected: '허용된 test identity의 승인된 namespace·read action은 유지되고 과도한 cluster-admin은 부여되지 않음', reason: 'security update와 IAM review가 정상 관리 흐름을 깨뜨리지 않는지 확인합니다.' },
    { case: 'Azure Stack Edge build threshold', expected: '해당 device가 2209 / 2.2.2088.5593 이상이고 관리 기능 baseline이 유지됨', reason: 'Arc agent 외 affected product를 version audit에서 놓치지 않습니다.' },
  ],
  limitation: '이 block은 실제 Microsoft remediation record이며 source-code diff가 아닙니다. MSRC가 공개하지 않은 내부 root cause, 변경 line, regression suite를 추정하지 않습니다. 화면은 live endpoint discovery, DNS 값, token, kubeconfig, cluster request, upgrade command 실행을 제공하지 않으며 version·책임·retest 설계만 읽습니다.',
}

const azureArcImpact = {
  id: 'w15-shared-responsibility-azure-impact',
  type: 'impact-map',
  title: '공개된 조건은 random external DNS endpoint를 아는 unauthenticated caller와 영향 build의 결합이다',
  intro: 'Microsoft CNA CVSS 3.1 base vector는 AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H, 10.0입니다. MSRC는 publicly disclosed: No, exploited: No, exploitation less likely로 기록했으며 이 값과 “영향 없음”은 같은 뜻이 아닙니다.',
  dimensions: [
    { label: '기밀성', impact: 'cluster-admin 권한은 Kubernetes workloads·secrets 등 cluster가 허용하는 data에 높은 기밀성 영향을 줄 수 있어 C:H입니다.', condition: '영향 Cluster Connect build, endpoint knowledge, successful unauthenticated privilege elevation, 실제 cluster data permissions가 이어져야 합니다.' },
    { label: '무결성', impact: 'administrative control은 workloads·configuration·RBAC 변경 가능성을 만들어 I:H로 평가됩니다.', condition: '성공한 cluster-admin authorization과 해당 apiserver에서 허용되는 write actions가 필요합니다.' },
    { label: '가용성', impact: '관리 권한으로 workload·cluster resource를 중단할 수 있는 범위 때문에 A:H입니다.', condition: '권한 상승 뒤 disruptive action이 허용되고 backup·policy·recovery가 영향을 제한하지 못해야 합니다.' },
  ],
  attackerControls: [
    'MSRC가 조건으로 명시한 randomly generated external DNS endpoint를 알고 있는지',
    '영향 Cluster Connect endpoint로 network request를 보내는 시점과 request context',
    '권한 상승 성공 뒤 cluster API에서 시도하는 action 종류',
  ],
  notControlled: [
    'cluster에 설치된 Arc agent의 exact version과 auto-upgrade 상태',
    'Azure service와 in-cluster identity·RBAC configuration, policy guardrails',
    'audit logging, network controls, backup, process·cluster recovery 설계',
    'Microsoft 내부 patch code와 공개되지 않은 exact faulty line',
  ],
  access: {
    authentication: 'PR:N이며 MSRC는 unauthenticated user가 cluster-admin으로 권한 상승할 수 있다고 설명합니다. 이는 정상 설계가 아니라 취약 효과입니다.',
    interaction: 'UI:N으로 다른 사용자의 행동은 필요하지 않습니다.',
    network: 'AV:N·AC:L입니다. MSRC FAQ의 추가 prerequisite는 randomly generated external DNS endpoint를 아는 것입니다. 수업은 endpoint를 찾거나 요청하지 않습니다.',
    defaultExposure: 'Cluster Connect가 사용되고 respective fixed build 미만인 Arc agents 또는 2.2.2088.5593 미만 Azure Stack Edge가 구체적 대상입니다. Arc 존재만으로 모든 cluster가 영향이라고 단정하지 않습니다.',
    protections: 'official fixed build·later version이 root remediation입니다. auto-upgrade/effective version 확인, least-privilege RBAC, audit, network control, backup은 layered controls이며 vendor update 대체물이 아닙니다.',
  },
}

const iamEvaluationMechanism = {
  id: 'w15-iam-least-privilege-evaluation-mechanism',
  type: 'mechanism',
  title: 'IAM decision은 principal·action·resource·condition과 모든 policy layer를 request context에서 계산한다',
  situation: '같은 principal이라도 action, 대상 resource, session, network, organization guardrail이 다르면 effective permission이 달라집니다. policy 한 장만 읽지 말고 request context와 identity·resource·boundary·organization policies의 교집합·합집합·explicit deny를 계산해야 합니다.',
  terms: [
    { term: 'Principal · 주체', meaning: 'user, role, workload session처럼 request identity를 나타내는 entity입니다.', contrast: 'credential string 자체나 human 이름만이 아니라 session과 account context를 포함합니다.' },
    { term: 'Action · 행동', meaning: 'service API에서 수행하려는 read, write, delete, assume-role 같은 operation입니다.', contrast: '화면 button 이름과 policy action 이름이 항상 일대일은 아닙니다.' },
    { term: 'Resource · 리소스', meaning: 'action의 대상 object를 account·service·region·path까지 식별한 값입니다.', contrast: '`*`는 편리한 placeholder가 아니라 모든 matching resource로 scope를 넓힐 수 있습니다.' },
    { term: 'Condition · 조건', meaning: 'time, source service, tag, TLS, session attribute처럼 statement가 적용될 추가 context입니다.', contrast: 'resource scope를 대신하지 않고 함께 만족해야 하는 guard입니다.' },
    { term: 'Explicit Deny · 명시적 거부', meaning: 'matching policy가 분명하게 Deny를 선언한 결과입니다.', contrast: 'Allow가 없어서 생기는 implicit deny와 원인은 다르지만 둘 다 최종 request를 거부합니다.' },
    { term: 'Permissions Boundary · 권한 경계', meaning: 'identity policy가 부여할 수 있는 최대 permission set입니다.', contrast: 'boundary 자체는 permission을 grant하지 않고 identity allow와 교집합을 만듭니다.' },
  ],
  stages: [
    { label: 'principal 인증', actor: 'identity provider·cloud service', input: 'temporary session, signed request, MFA·federation context', action: '필요한 경우 caller identity와 session attributes를 확인합니다.', output: 'authenticated principal 또는 authentication failure' },
    { label: 'request context 생성', actor: 'service authorization layer', input: 'principal, action, resource, region, tags, network·time context', action: '적용 가능한 policy를 찾을 canonical request values를 만듭니다.', output: 'immutable evaluation context' },
    { label: 'policy 수집', actor: 'IAM engine', input: 'identity/resource policies, boundary, SCP·RCP, session policies', action: 'principal·resource·organization에 연결된 모든 applicable statements를 모읍니다.', output: 'policy layers and matching candidates' },
    { label: 'statement match', actor: 'IAM engine', input: 'action, resource, principal, condition', action: '각 statement가 request context 전체와 match하는지 평가합니다.', output: 'matching allow·deny statements' },
    { label: 'layer 조합', actor: 'IAM enforcement', input: 'identity/resource union과 boundary·organization intersections', action: '공식 조합 규칙을 적용하고 어느 layer든 explicit deny면 allow를 override합니다.', output: 'effective permission set' },
    { label: '결정·기록', actor: 'service·audit log', input: 'effective permission과 request', action: '명시적 allow가 남으면 실행하고 아니면 deny하며 decision context를 기록합니다.', output: 'bounded action result and audit evidence' },
  ],
  trustBoundary: {
    before: '인증된 principal과 JSON policy 한 장만으로는 최종 permission을 알 수 없습니다.',
    decision: 'cloud IAM enforcement가 full request context와 모든 applicable policy layer를 함께 평가해야 합니다.',
    after: '허용된 action만 specific resource·condition에서 실행되고 allow·deny 근거를 조사할 log가 남습니다.',
    failure: 'wildcard allow, 빠진 resource·condition, 우회 가능한 boundary, 오래된 session을 놓치면 업무 필요보다 넓은 effective permission이 생깁니다.',
  },
}

const iamEvaluatorTrace = {
  id: 'w15-iam-least-privilege-evaluator-trace',
  type: 'code-trace',
  title: '합성 report-reader request를 deny-by-default로 계산하는 교육용 evaluator',
  evidenceKind: 'educational-model',
  source: awsIamEvaluation,
  language: 'python',
  description: '실제 AWS enforcement source가 아니라 공식 evaluation 순서를 단순화한 local model입니다. real ARN·account·credential 없이 fixed booleans의 state transition만 보여 줍니다.',
  code: '1  request = {"principal":"training-report-reader",\n2             "action":"reports:GetObject",\n3             "resource":"reports/quarterly/q2.pdf",\n4             "condition":{"approved_session": True}}\n5  identity_allow = matches_identity_policy(request)\n6  resource_allow = matches_resource_policy(request)\n7  boundary_allow = matches_permission_boundary(request)\n8  organization_allow = matches_guardrails(request)\n9  explicit_deny = any_matching_explicit_deny(request)\n10 candidate_allow = (identity_allow or resource_allow)\n11 decision = "Deny" if explicit_deny else (\n12     "Allow" if candidate_allow and boundary_allow and organization_allow else "Deny")\n13 audit = {"request_id":"TRAINING-REQ-07", "decision":decision, "policy_version":"v3"}',
  trace: [
    { lines: '1–4', before: '“reader user”라는 이름만 있고 어떤 action·resource·session인지 모릅니다.', action: 'principal, read action, one report resource, approved-session condition을 context로 만듭니다.', after: 'policy statement와 비교할 네 축이 고정됩니다.' },
    { lines: '5–8', before: '한 identity policy의 Allow만 보고 최종 결정을 낼 위험이 있습니다.', action: 'identity·resource allow와 boundary·organization guardrail 결과를 따로 계산합니다.', after: 'union으로 grant하는 layer와 maximum scope를 줄이는 layer가 분리됩니다.' },
    { lines: '9–12', before: 'allow 후보와 explicit deny 우선순위가 아직 합쳐지지 않았습니다.', action: 'matching explicit deny가 있으면 즉시 Deny, 아니면 allow 후보와 두 guardrail이 모두 true일 때만 Allow합니다.', after: 'default Deny를 유지한 effective decision이 생깁니다.' },
    { lines: '13', before: '결과만 있고 어떤 policy version에서 나온 결정인지 추적할 수 없습니다.', action: '합성 request ID, decision, policy version만 audit card에 남깁니다.', after: 'raw token 없이 authorization retest를 비교할 최소 evidence가 생깁니다.' },
  ],
}

const cloudIamControls = {
  id: 'w15-iam-least-privilege-control-layers',
  type: 'comparison',
  title: 'Code·config·permission·log·test를 cloud IAM 경계에 연결하기',
  columns: ['층', '무엇을 제한·수정하는가', '검증 evidence'],
  rows: [
    ['Code', 'vendor security update와 customer workload authorization code의 root cause를 각 owner가 수정', 'MSRC fixed build 또는 actual source diff; 서로를 대체하지 않음'],
    ['Config', 'auto-upgrade, federation, MFA, condition, network·backup settings의 effective state를 관리', 'versioned configuration snapshot과 drift finding'],
    ['Permission', 'temporary role, action, resource, condition, boundary·SCP로 업무 범위를 제한', 'effective-policy simulation과 approved access matrix'],
    ['Log', 'principal session ID, action, resource, decision, policy·agent version을 보존하고 token·secret은 제외', 'audit event와 alert·review ticket correlation'],
    ['Test', 'unauthenticated deny, authorized normal task, forbidden write, fixed version, recovery를 staging에서 재시험', 'deny/allow oracle, no privilege expansion, normal workflow 유지'],
  ],
}

const cloudGoatBoundaryMechanism = {
  id: 'w15-isolated-cloudgoat-boundary-mechanism',
  type: 'mechanism',
  title: 'CloudGoat는 production 옆에서 쓰는 scanner가 아니라 별도 계정에 취약 resource를 만드는 lab이다',
  situation: 'cloud attack path를 학습하려면 의도적으로 잘못 구성된 resource와 비용·log·credential lifecycle이 필요합니다. 공식 저장소도 production 또는 sensitive resource 옆에 배포하지 말라고 경고하므로 실행 전 격리와 teardown 책임이 먼저 정해져야 합니다.',
  terms: [
    { term: 'Vulnerable by Design · 의도적 취약 구성', meaning: '학습 목표를 위해 일부 permission·service를 일부러 위험하게 배치한 environment입니다.', contrast: '운영 cloud의 안전한 reference architecture나 임의 조직을 test할 권한이 아닙니다.' },
    { term: 'Isolated Account · 격리 계정', meaning: 'production data·identity·network와 trust 관계가 없는 training 전용 cloud account·subscription입니다.', contrast: '같은 account의 별도 resource group만으로 모든 privilege path가 격리된다고 단정할 수 없습니다.' },
    { term: 'Scenario Scope · 시나리오 범위', meaning: '허용된 scenario, identity, region, time, goal, actions를 적은 authorization boundary입니다.', contrast: 'tool이 기술적으로 가능한 모든 action의 허가 목록이 아닙니다.' },
    { term: 'Teardown · 정리', meaning: 'scenario resource를 삭제하고 별도 생성 resource·credential·cost·log를 확인하는 종료 단계입니다.', contrast: 'destroy command 성공 메시지만으로 account가 깨끗하다는 보장은 없습니다.' },
    { term: 'Credential Boundary · 자격 증명 경계', meaning: 'training identity가 사용할 account·role·기간·storage를 제한한 계약입니다.', contrast: 'host의 실제 AWS config를 container에 mount하는 것은 credential exposure를 넓힐 수 있습니다.' },
  ],
  stages: [
    { label: '서면 범위 승인', actor: 'course operator·account owner', input: 'scenario, isolated account, region, time, budget, prohibited links', action: 'production·sensitive resource와 trust가 없는지 확인하고 stop condition을 승인합니다.', output: 'signed scope card' },
    { label: 'identity 격리', actor: 'cloud administrator', input: 'training-only role과 temporary credentials', action: 'production roles·shared secrets·cross-account trust가 없는 최소 permission identity를 준비합니다.', output: 'time-bounded lab identity' },
    { label: '사전 inventory', actor: 'learner·operator', input: 'empty baseline, cost alert, logging, scenario manifest', action: 'tool이 만들 resource와 student-created resource owner를 구분합니다.', output: 'baseline inventory and cleanup owner' },
    { label: '허용 scenario 실행', actor: 'learner in approved lab', input: 'specific scenario and scope card', action: '지정된 goal·time 안에서만 활동하고 unexpected resource·permission이면 중단합니다.', output: 'training evidence and resource changes' },
    { label: '정리 실행', actor: 'learner·CloudGoat', input: 'scenario-managed resources and manual-resource list', action: 'tool-managed resource를 정리하고 직접 만든 resource는 owner가 별도로 제거합니다.', output: 'post-destroy inventory' },
    { label: '독립 종료 확인', actor: 'account owner', input: 'inventory diff, active credentials, cost, logs, trust links', action: 'console·inventory로 잔여 resource와 access를 확인하고 credentials를 revoke합니다.', output: 'closed lab record or remediation ticket' },
  ],
  trustBoundary: {
    before: 'open-source tool과 개인 cloud account가 있다는 사실은 production-like 공격 실습의 authorization이 아닙니다.',
    decision: 'account owner와 course operator가 isolation, scenario, budget, time, cleanup을 모두 명시해야 실행 경계를 통과합니다.',
    after: 'training-only identity는 approved scenario resource만 만들고 종료 뒤 inventory·credential·cost가 확인됩니다.',
    failure: 'production 옆 배포, host credential mount, 수동 resource 누락, teardown 미검증은 data exposure·비용·잔여 privilege를 만들 수 있습니다.',
  },
}

const cloudGoatScopeTrace = {
  id: 'w15-isolated-cloudgoat-scope-trace',
  type: 'code-trace',
  title: '명령보다 먼저 모두 충족해야 하는 CloudGoat 실행 전 scope gate',
  evidenceKind: 'educational-model',
  source: cloudGoatRepo,
  language: 'yaml',
  description: '설치·배포·공격 command가 아닌 합성 승인 record입니다. 현재 과정은 이 값들을 실제로 제공하지 않으므로 orientation은 문서 읽기에서 멈춥니다.',
  code: '1  provider_warning_read: true\n2  isolated_training_account: not_provided_by_this_course\n3  production_or_sensitive_resources: must_be_absent\n4  approved_scenario: not_assigned\n5  allowed_region_and_window: not_assigned\n6  temporary_identity_owner: not_assigned\n7  budget_alert_and_audit: not_verified\n8  manual_resource_cleanup_owner: not_assigned\n9  post_destroy_inventory_reviewer: not_assigned\n10 decision: DO_NOT_EXECUTE\n11 allowed_activity: read_official_scope_and_write_checklist_only',
  trace: [
    { lines: '1–3', before: 'CloudGoat가 교육 tool이라는 사실만 알고 provider warning과 account isolation을 확인하지 않았습니다.', action: 'production·sensitive resource 금지 경고를 읽고 이 과정이 격리 account를 제공하지 않았음을 기록합니다.', after: '실행 prerequisite가 충족되지 않았다는 첫 차단 근거가 생깁니다.' },
    { lines: '4–7', before: 'scenario, region, time, identity, cost·audit owner가 없습니다.', action: '각 필드를 `not_assigned` 또는 `not_verified`로 명시합니다.', after: '빈칸을 임의 추정하지 않고 담당자에게 물어야 할 항목이 보입니다.' },
    { lines: '8–9', before: 'tool이 만들지 않은 resource와 종료 검토 책임이 없습니다.', action: 'manual cleanup owner와 independent inventory reviewer를 요구합니다.', after: 'destroy 실행과 실제 account clean state를 구분합니다.' },
    { lines: '10–11', before: '일부 prerequisite만 보고 실행할 위험이 있습니다.', action: '하나라도 누락되면 `DO_NOT_EXECUTE`, 공식 warning과 checklist 읽기만 허용합니다.', after: '실제 credential·deployment·enumeration 없이 안전한 orientation에서 끝납니다.' },
  ],
}

function appendUniqueSources(block, additions) {
  const items = [...(block.items || [])]
  additions.forEach((source) => {
    if (!items.some((item) => item.url === source.url)) items.push(source)
  })
  return { ...block, items }
}

function enrichAzureArcCve(block) {
  const additions = [msrcAzureArc, msrcAzureArcCvrf, nvdAzureArc, azureClusterConnect, azureIdentity, azureAgentUpgrade]
  const sources = [...(block.sources || [])]
  additions.forEach((source) => {
    if (!sources.some((item) => item.url === source.url)) sources.push(source)
  })
  return {
    ...block,
    title: '공유 책임 사례: Azure Arc Cluster Connect vendor patch와 customer IAM은 서로 다른 통제다',
    productRole: 'Azure Arc-enabled Kubernetes Cluster Connect는 local proxy와 Azure service·in-cluster agents를 통해 Kubernetes apiserver 관리 access를 중계합니다. Azure Stack Edge도 Arc를 통해 Kubernetes workloads를 지원해 영향 제품에 포함됩니다.',
    weakness: 'unauthenticated elevation of privilege to cluster-admin · exact internal root-cause line not publicly disclosed',
    affectedVersions: 'respective Azure Arc agent release lines에서 1.5.8 / 1.6.19 / 1.7.18 / 1.8.11 미만. Azure Stack Edge 2.2.2088.5593 미만. Cluster Connect 사용·endpoint prerequisite를 함께 확인',
    fixedVersions: 'Azure Arc agents 1.5.8+, 1.6.19+, 1.7.18+, 1.8.11+ (1.8.14도 보호). Azure Stack Edge 2209 / 2.2.2088.5593+',
    cause: 'Microsoft가 공개적으로 확인한 failure는 Cluster Connect에서 unauthenticated user가 privileges를 cluster-admin으로 높여 Kubernetes cluster의 administrative control을 얻을 수 있었다는 점입니다. MSRC는 내부 faulty function, validation condition, source line을 공개하지 않았으므로 이 화면은 더 구체적인 root cause를 추정하지 않습니다.',
    condition: 'attacker가 영향을 받는 Cluster Connect의 randomly generated external DNS endpoint를 알고 internet에서 접근할 수 있어야 합니다. 영향 agent·Stack Edge build가 남아 있어야 하며 수업은 endpoint discovery, network request, token·kubeconfig, live cluster를 사용하지 않습니다.',
    patch: 'MSRC security update는 Arc agent 1.5.8, 1.6.19, 1.7.18, 1.8.11과 Stack Edge 2.2.2088.5593을 fixed builds로 지정합니다. auto-upgrade enabled 고객은 자동 보호되며 수동 고객은 latest version으로 update해야 합니다. 공개 source diff는 없으므로 effective version과 정상·deny behavior를 운영 evidence로 확인합니다.',
    followOn: '고객의 RBAC 최소 권한·logging은 blast radius와 detection을 줄이는 보완 통제지만 vendor security update의 대체가 아닙니다. CloudGoat 또는 다른 cloud scenario와의 exploit chain은 공식 근거로 검증되지 않아 미채택입니다.',
    facts: [
      'Microsoft CNA CVSS는 10.0, AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H입니다.',
      'MSRC는 공개 당시 Publicly Disclosed: No, Exploited: No, exploitation less likely로 기록했습니다.',
      'version audit은 CLI 설치 여부가 아니라 각 cluster의 reported agent version과 auto-upgrade effective state를 확인해야 합니다.',
      '실습은 합성 책임·IAM cards만 사용하고 실제 cloud account, endpoint, credential, cluster를 읽거나 변경하지 않습니다.',
    ],
    sources,
  }
}

function addAfter(blocks, predicate, additions) {
  const index = blocks.findIndex(predicate)
  if (index < 0) return [...blocks, ...additions]
  return [...blocks.slice(0, index + 1), ...additions, ...blocks.slice(index + 1)]
}

function enrichSharedResponsibility(blocks) {
  const cveIndex = blocks.findIndex((block) => block.type === 'cve-case')
  const cve = enrichAzureArcCve(blocks[cveIndex])
  const withoutCve = blocks.filter((_, index) => index !== cveIndex)
  const enriched = addAfter(withoutCve, (block) => block.type === 'explanation', [
    sharedResponsibilityMechanism,
    responsibilityTrace,
    clusterConnectMechanism,
    cve,
    azureRemediationAnalysis,
    azureArcImpact,
  ])
  return enriched.map((block) => block.type === 'sources'
    ? appendUniqueSources(block, [awsShared, azureClusterConnect, azureIdentity, azureAgentUpgrade, msrcAzureArc, msrcAzureArcCvrf, nvdAzureArc])
    : block)
}

function enrichWithBlocks(blocks, additions, sources) {
  const enriched = addAfter(blocks, (block) => block.type === 'explanation', additions)
  return enriched.map((block) => block.type === 'sources' ? appendUniqueSources(block, sources) : block)
}

export function buildWeek14CloudIamGuide(modules) {
  const enrichers = {
    'w15-shared-responsibility': enrichSharedResponsibility,
    'w15-iam-least-privilege': (blocks) => enrichWithBlocks(blocks, [iamEvaluationMechanism, iamEvaluatorTrace, cloudIamControls], [awsIamEvaluation, awsIamBest, awsShared]),
    'w15-isolated-cloudgoat': (blocks) => enrichWithBlocks(blocks, [cloudGoatBoundaryMechanism, cloudGoatScopeTrace], [cloudGoatRepo, awsShared, awsIamBest]),
  }

  return modules.map((module) => ({
    ...module,
    contentLevel: 'concept-code-cve-v1',
    blocks: enrichers[module.id] ? enrichers[module.id](module.blocks) : module.blocks,
  }))
}
