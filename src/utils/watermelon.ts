export type StandardProcessedDataArray = {
  title: string;
  body?: string;
  link?: string;
  number?: number | string;
  image?: string;
}[];
export type StandardServiceData = {
  serviceName: string;
  serviceData: StandardProcessedDataArray;
};
