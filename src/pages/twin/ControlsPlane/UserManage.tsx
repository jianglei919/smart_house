/*
 * @Author: smartHome
 * @Date: 2025-10-24 13:24:47
 * @LastEditors: smartHome
 * @LastEditTime: 2025-10-25 23:06:08
 * @Description:
 */
import { DBUserInfo } from "@/pages";
import { flexCenter } from "@/src/styled";
import DBWrapper from "@/src/utils/DBWrapper";
import { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import styled from "styled-components";

interface IProps {
    close: () => void;
}

const UserManage: FC<IProps> = ({ close }) => {
    const [users, setUsers] = useState([] as DBUserInfo[]);
    const dbRef = useRef<any>(null);

    useEffect(() => {
        (async () => {
            const db = new (DBWrapper as any)("smart_house", "1", {
                onupgradeneeded: (e: any) => {
                    const db = e.target.result;
                    const objStore = db.createObjectStore("user", {
                        autoIncrement: true,
                        keyPath: "id",
                    });
                    objStore.createIndex("name", "name", { unique: 1 });
                },
            });
            dbRef.current = db;
            await db.open();
            const query = await db.getAll("user");
            console.log(query);
            setUsers(query.filter((u: DBUserInfo) => u.name != "admin"));
        })();
    }, []);

    return (
        <>
            <Overlay onClick={close} />
            <Container>
                <Header>
                    <Title>User Management</Title>
                    <CloseButton onClick={close}>✕</CloseButton>
                </Header>

                {users.length > 0 ? (
                    <>
                        <UserList>
                            {users.map((user) => (
                                <UserItem key={user.name}>
                                    <UserLabel>{user.name}</UserLabel>
                                    <PasswordInput
                                        type="text"
                                        value={user.password}
                                        placeholder="Enter password"
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                            setUsers((users) =>
                                                users.map((u) => {
                                                    if (u.name == user.name) {
                                                        u.password = e.target.value;
                                                    }
                                                    return u;
                                                })
                                            );
                                        }}
                                    />
                                    <ButtonGroup>
                                        <Button
                                            onClick={async () => {
                                                if (dbRef.current) {
                                                    dbRef.current
                                                        .put("user", {
                                                            ...user,
                                                        })
                                                        .then((res: number) => {
                                                            setTimeout(() => {
                                                                console.log("res", res);
                                                                alert("Update successful");
                                                            }, 100);
                                                        })
                                                        .catch((err: any) => {
                                                            console.log("err", err);
                                                            alert("Update failed");
                                                        });
                                                }
                                            }}
                                        >
                                            Update
                                        </Button>
                                        <Button
                                            onClick={async () => {
                                                if (dbRef.current) {
                                                    dbRef.current
                                                        .delete("user", user.id)
                                                        .then((res: number) => {
                                                            setTimeout(() => {
                                                                console.log("res", res);
                                                                alert("Delete successful");
                                                                setUsers((users) =>
                                                                    users.filter(
                                                                        (u) => u.id != user.id
                                                                    )
                                                                );
                                                            }, 100);
                                                        })
                                                        .catch((err: any) => {
                                                            console.log("err", err);
                                                            alert("Delete failed");
                                                        });
                                                }
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </ButtonGroup>
                                </UserItem>
                            ))}
                        </UserList>
                    </>
                ) : (
                    <EmptyState>No user data available</EmptyState>
                )}
            </Container>
        </>
    );
};

export default UserManage;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 98;
    animation: fadeIn 0.2s ease;

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
`;

const Title = styled.h2`
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #ffffff;
    letter-spacing: 0.5px;
`;

const CloseButton = styled.button`
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    border-radius: 8px;
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: rotate(90deg);
    }

    &:active {
        transform: rotate(90deg) scale(0.9);
    }
`;

const UserList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const UserItem = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 16px;
    transition: all 0.2s ease;
    animation: slideIn 0.3s ease;

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    &:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.25);
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }
`;

const UserLabel = styled.span`
    color: #e0e7ff;
    font-weight: 600;
    font-size: 15px;
    min-width: 100px;
    flex-shrink: 0;
`;

const PasswordInput = styled.input`
    flex: 1;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
    outline: none;
    padding: 10px 14px;
    color: #ffffff;
    font-size: 14px;
    transition: all 0.2s ease;

    &:focus {
        border-color: #60a5fa;
        background: rgba(255, 255, 255, 0.15);
        box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
    }

    &::placeholder {
        color: rgba(255, 255, 255, 0.4);
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 8px;
    flex-shrink: 0;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 60px 20px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 16px;
`;

const Button = styled.button`
    cursor: pointer;
    min-width: 70px;
    height: 36px;
    padding: 8px 16px;
    border: none;
    color: #ffffff;
    font-weight: 500;
    font-size: 14px;
    ${flexCenter};
    transition: all 0.2s ease;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    }

    &:active {
        transform: translateY(0);
        box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
    }

    &:last-of-type {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);

        &:hover {
            background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }
    }
`;

const Container = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%);
    border-radius: 16px;
    z-index: 99;
    max-width: 600px;
    max-height: 80vh;
    min-width: 500px;
    color: #ffffff;
    padding: 32px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 
                0 0 0 1px rgba(255, 255, 255, 0.1) inset;
    backdrop-filter: blur(10px);
    overflow-y: auto;
    animation: scaleIn 0.3s ease;

    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }

    /* 滚动条样式 */
    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;

        &:hover {
            background: rgba(255, 255, 255, 0.3);
        }
    }
`;

