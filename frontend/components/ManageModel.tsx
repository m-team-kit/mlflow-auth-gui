import { FC } from 'react';

type ManageModelProps = {
  modelName: string;
};
const ManageModel: FC<ManageModelProps> = ({ modelName }) => {
  return (
    <>
      <h1>Manage Model {modelName}</h1>
    </>
  );
};

export default ManageModel;
