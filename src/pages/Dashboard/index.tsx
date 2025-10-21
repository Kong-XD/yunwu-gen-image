import React, { useState } from 'react';
import { Card, Upload, Button, Input, Space, message, Image } from 'antd';
import {
  CloudUploadOutlined,
  FileTextOutlined,
  FileOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
// @ts-ignore
import Papa from 'papaparse';
import './index.less';

const { TextArea } = Input;

const Dashboard: React.FC = () => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [promptContent, setPromptContent] = useState('');

  // 参考图上传配置
  const uploadProps = {
    name: 'file',
    multiple: true,
    fileList,
    beforeUpload: (file: any) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件!');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('图片大小不能超过 10MB!');
        return false;
      }
      return false; // 阻止自动上传
    },
    onChange: (info: any) => {
      setFileList(info.fileList.slice(-20)); // 最多20张
    },
    onDrop: (e: any) => {
      console.log('Dropped files', e.dataTransfer.files);
    },
    onRemove: (file: any) => {
      const newFileList = fileList.filter(item => item.uid !== file.uid);
      setFileList(newFileList);
    },
  };


  // 删除图片
  const handleRemoveImage = (uid: string) => {
    const newFileList = fileList.filter(item => item.uid !== uid);
    setFileList(newFileList);
  };


  // 使用PapaParse解析CSV内容
  const parseCSV = (csvText: string) => {
    console.log('CSV原始内容:', csvText);
    
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results: any) => {
        console.log('PapaParse解析完成:', results);
      },
      error: (error: any) => {
        console.error('PapaParse解析错误:', error);
      }
    });
    
    console.log('解析结果:', result.data);
    return result.data;
  };

  // 处理文件上传
  const handleFileUpload = (file: any) => {
    // 检查是否为CSV文件
    if (file.name.toLowerCase().endsWith('.csv')) {
      // 使用FileReader读取文件，然后使用PapaParse解析
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target?.result as string;
        console.log('读取的CSV内容:', csvText);
        
        // 使用PapaParse解析CSV文本
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          encoding: 'UTF-8',
          complete: (results: any) => {
            console.log('PapaParse解析完成:', results);
            const csvData = results.data;
            
            // 显示所有列名，帮助调试
            if (csvData.length > 0) {
              const headers = Object.keys(csvData[0]);
              console.log('CSV列名:', headers);
            }
            
            // 查找包含分镜提示词的行
            const validShots = csvData.filter((row: any) => {
              // 尝试不同的列名
              const shotNumber = row['分镜数'] || row['分镜'] || row['序号'] || row['编号'];
              const prompt = row['分镜提示词'] || row['提示词'] || row['内容'] || row['描述'];
              
              const hasShotNumber = shotNumber && shotNumber.toString().trim();
              const hasPrompt = prompt && prompt.toString().trim();
              
              console.log('检查行:', row, 'hasShotNumber:', hasShotNumber, 'hasPrompt:', hasPrompt);
              return hasShotNumber && hasPrompt;
            });
            
            console.log('有效的分镜数据:', validShots);
            
            if (validShots.length === 0) {
              message.warning('未找到有效的分镜提示词数据，请检查CSV文件格式');
              
              // 显示调试信息
              const debugInfo = `CSV调试信息:\n\n原始内容:\n${csvText.substring(0, 500)}...\n\n解析后的数据:\n${JSON.stringify(csvData.slice(0, 3), null, 2)}`;
              setPromptContent(debugInfo);
              return;
            }
            
            const shotPrompts = validShots
              .map((row: any) => {
                const shotNumber = row['分镜数'] || row['分镜'] || row['序号'] || row['编号'] || '';
                const prompt = row['分镜提示词'] || row['提示词'] || row['内容'] || row['描述'] || '';
                return `分镜${shotNumber}:\n${prompt}`;
              })
              .join('\n\n' + '='.repeat(50) + '\n\n');
            
            setPromptContent(shotPrompts);
            message.success(`成功解析CSV文件，提取了${validShots.length}条分镜提示词`);
          },
          error: (error: any) => {
            console.error('PapaParse解析错误:', error);
            message.error('CSV文件解析失败，请检查文件格式');
          }
        });
      };
      
      // 尝试不同的编码
      reader.readAsText(file, 'UTF-8');
    } else {
      // JSON文件使用FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setPromptContent(content);
        message.success('文件内容已加载到文本区域');
      };
      reader.readAsText(file);
    }
    
    return false; // 阻止自动上传
  };

  // CSV/JSON 文件上传配置
  const fileUploadProps = {
    name: 'file',
    accept: '.csv,.json',
    beforeUpload: handleFileUpload,
    showUploadList: false,
  };

  return (
    <div className="dashboard-page">
      <div className="page-layout">
        {/* 左侧列 */}
        <div className="left-column">
          {/* 参考图上传 */}
          <Card 
            title={
              <span>
                <CloudUploadOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                参考图上传
              </span>
            }
            className="upload-card"
          >
            <Upload.Dragger {...uploadProps} className="upload-dragger">
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined style={{ fontSize: 48, color: '#722ed1' }} />
              </p>
              <p className="ant-upload-text">拖拽图片到此处,或点击选择</p>
              <p className="ant-upload-hint">
                支持 JPG、PNG、GIF 格式，单个文件不超过 10MB
              </p>
            </Upload.Dragger>
            <div className="upload-info">
              {fileList.length}/20 images
            </div>
            
            {/* 图片预览区域 */}
            {fileList.length > 0 && (
              <div className="image-preview-section">
                <div className="preview-title">已上传图片</div>
                <div className="image-grid">
                  {fileList.map((file) => (
                    <div key={file.uid} className="image-item">
                      <Image
                        src={file.thumbUrl || URL.createObjectURL(file.originFileObj)}
                        alt={file.name}
                        className="preview-image"
                        preview={{
                          mask: <div className="preview-mask">预览</div>
                        }}
                      />
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        className="delete-btn"
                        onClick={() => handleRemoveImage(file.uid)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* 提示词导入/导出 */}
          <Card 
            title={
              <span>
                <FileTextOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                提示词导入/导出
              </span>
            }
            className="prompt-card"
          >
            <TextArea
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
              placeholder="粘贴JSON内容或拖拽JSON/CSV文件..."
              rows={8}
              className="prompt-textarea"
            />
            
            <div className="prompt-buttons">
              <Upload {...fileUploadProps}>
                <Button 
                  type="primary" 
                  icon={<FileOutlined />}
                  className="upload-file-btn"
                >
                  JSON/CSV
                </Button>
              </Upload>
            </div>

          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


