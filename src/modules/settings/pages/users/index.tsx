import $axiosPrivate from "@/services/AxiosService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Dropdown,
  Spin,
  Tag,
  type MenuProps,
  type TableColumnsType,
} from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import toast from "react-hot-toast";
import { FilterFilled } from "@ant-design/icons";

import { ReloadOutlined, PlusOutlined } from "@ant-design/icons";
import { Flex } from "antd";
import UsersAddModal from "./add";
import { useState } from "react";
import UsersEditModal from "./edit";
import CustomTable from "@/utils/CustomTable";
import { stateStatus } from "@/utils/helpers/statusHelper";
import { customPhoneNumber } from "@/utils/utils";

interface UsersTableType {
  id: number;
  userName: string;
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  lastAccessTime: string;
  stateId: number;
  createdDate: string;
  roleName: string;
  stateName: string;
}

function Users() {
  const [modal, contextHolder] = Modal.useModal();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: (id: number) => $axiosPrivate.delete(`users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["UserData"] });
      toast.success("Muvaffaqiyatli o'chirdingiz!");
    },
    onError: (error) => {
      toast.error(`Xatolik yuz berdi${error}`);
    },
  });
  const { data: UserData, isLoading } = useQuery({
    queryKey: ["UserData"],
    queryFn: async () => {
      try {
        const { data } = await $axiosPrivate.get("users");
        return data.items;
      } catch (error) {
        console.error(error);
      }
    },
  });
  const columns: TableColumnsType<UsersTableType> = [
    {
      title: "T/r",
      key: "index",
      width: 50,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Mijoz",
      dataIndex: "userName",
      width: 500,
    },
    {
      title: "Tel nomer",
      dataIndex: "phoneNumber",
      width: 200,
      align: "center",
      render: (text) => customPhoneNumber(text),
    },
    {
      title: "Holati",
      dataIndex: "state",
      align: "center",
      render: (_, record) => stateStatus(record.stateId, record.stateName),
    },
    {
      title: "Amallar",
      width: 200,
      align: "center",
      render: (_, record) => {
        const items: MenuProps["items"] = [
          {
            label: "Tahrirlash",
            key: "edit",
          },
          {
            label: "O'chirish",
            key: "delete",
            danger: true,
          },
        ];
        const handleMenuClick = (info: { key: string }) => {
          if (info.key === "edit") {
            setSelectedUser(record);
            setIsEditModalOpen(true);
          } else if (info.key === "delete") {
            modal.confirm({
              title: "Diqqat",
              content: "Ushbu ma'lumotni o'chirishga aminmisiz?",
              onOk: () => mutate(record.id),
            });
          }
        };

        return (
          <div>
            <Dropdown
              menu={{ items, onClick: handleMenuClick }}
              placement="bottom"
            >
              <Button
                icon={
                  <MoreOutlined
                    style={{
                      fontSize: "18px",
                      color: "#595959",
                    }}
                  />
                }
                loading={isPending}
              />
            </Dropdown>
          </div>
        );
      },
    },
  ];
  return (
    <>
      <div className=" bg-white rounded-2xl mb-3">
        <div>
          <div
            style={{
              backgroundColor: "#fff",
              padding: "15px 20px",
              borderRadius: "8px",
              border: "1px solid #f0f0f0",
              borderBottom: "none",
            }}
          >
            <Flex justify="space-between" align="center">
              <Button icon={<FilterFilled />} className="">
                Filter
              </Button>
              <Flex justify="space-between" align="center" gap={15}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() =>
                    queryClient.refetchQueries({ queryKey: ["UserData"] }, {})
                  }
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddModalOpen(true)}
                />
              </Flex>
            </Flex>
          </div>
        </div>
      </div>
      <div>
        <Spin spinning={isLoading}>
          <div className="bg-white">
            {contextHolder}
            <CustomTable<UsersTableType>
              columns={columns}
              dataSource={UserData}
              pagination={{
                defaultPageSize: 50,
              }}
              rowKey="id"
              scroll={{ y: "calc(100vh - 280px)", x: "max-content" }}
              size="medium"
            />
          </div>
        </Spin>
      </div>
      <UsersAddModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      {isEditModalOpen && selectedUser && (
        <UsersEditModal
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          currentUser={selectedUser}
        />
      )}
    </>
  );
}
export default Users;
