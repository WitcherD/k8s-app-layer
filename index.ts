import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";

const namespace = 'dev';

const pb = new kx.PodBuilder({
    containers: [{ image: "nginx", ports: { http: 80 } }]
});

const deployment = new kx.Deployment("nginx", {
    metadata: { namespace: namespace },
    spec: pb.asDeploymentSpec()
});

const service = deployment.createService({
    type: kx.types.ServiceType.ClusterIP,
    ports: [{ port: 80, targetPort: 80, name: 'http' }]
});

const backendIngress = new k8s.networking.v1.Ingress('nginx-ingress', {
    metadata: {
        name: 'nginx-ingress',
        namespace: namespace
    },
    spec: {
        rules: [{
            host: '6d540e71-e727-4555-91e7-7065f47aabbd.k8s.civo.com',
            http: { paths: [{ path: '/', pathType: 'Prefix', backend: { service: { name: service.metadata.name, port: { number: 80 } } } }] }
        }]
    }
});