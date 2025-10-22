import React, { useState } from 'react';
import { Card, Upload, Button, Input, Space, message, Image } from 'antd';
import {
  CloudUploadOutlined,
  FileTextOutlined,
  FileOutlined,
  DeleteOutlined,
  GlobalOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
// @ts-ignore
import Papa from 'papaparse';
import './index.less';

const { TextArea } = Input;

const Dashboard: React.FC = () => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [promptContent, setPromptContent] = useState('');
  const [validShots, setValidShots] = useState<any[]>([]);
  const [editingScene, setEditingScene] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<any>({});

  // 解析场景的提示词内容
  const parseScenePrompt = (sceneData: any) => {
    if (!sceneData) return null;
    
    const prompt = sceneData['分镜提示词'] || sceneData['提示词'] || sceneData['内容'] || sceneData['描述'] || '';
    
    // 尝试解析JSON格式的提示词
    try {
      const parsedPrompt = JSON.parse(prompt);
      return parsedPrompt;
    } catch (error) {
      // 如果不是JSON格式，返回原始文本
      return {
        subject: {
          characters: '',
          expression: '',
          action: prompt
        },
        environment: '',
        time: '',
        weather: '',
        perspective: '',
        shotType: ''
      };
    }
  };

  // 开始编辑场景
  const startEditing = (sceneIndex: number) => {
    const sceneData = validShots[sceneIndex];
    const parsedPrompt = parseScenePrompt(sceneData);
    setEditingScene(sceneIndex);
    setEditingContent(parsedPrompt || {});
  };

  // 取消编辑
  const cancelEditing = () => {
    setEditingScene(null);
    setEditingContent({});
  };

  // 保存编辑
  const saveEditing = () => {
    if (editingScene !== null) {
      const updatedShots = [...validShots];
      const promptText = JSON.stringify(editingContent);
      updatedShots[editingScene] = {
        ...updatedShots[editingScene],
        '分镜提示词': promptText,
        '提示词': promptText,
        '内容': promptText,
        '描述': promptText
      };
      setValidShots(updatedShots);
      setEditingScene(null);
      setEditingContent({});
      message.success('场景内容已保存');
    }
  };

  // 更新编辑内容
  const updateEditingContent = (field: string, value: string) => {
    setEditingContent((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // 更新主体内容
  const updateSubjectContent = (field: string, value: string) => {
    setEditingContent((prev: any) => ({
      ...prev,
      subject: {
        ...prev.subject,
        [field]: value
      }
    }));
  };

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
  const handleFileUpload = async (file: any) => {
    // 检查是否为CSV文件
    if (file.name.toLowerCase().endsWith('.csv')) {
      try {
        // 读取文件为ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        console.log('文件字节长度:', bytes.length);
        
        // 尝试不同编码
        let decodedText = '';
        let encoding = 'UTF-8';
        
        // 首先尝试UTF-8
        try {
          const utf8Decoder = new TextDecoder('utf-8');
          decodedText = utf8Decoder.decode(bytes);
          console.log('UTF-8解码结果:', decodedText.substring(0, 200));
          
          // 检查是否有乱码
          if (decodedText.includes('') || decodedText.includes('')) {
            throw new Error('UTF-8解码出现乱码');
          }
        } catch (error) {
          console.log('UTF-8解码失败，尝试GBK编码');
          
          // 尝试GBK编码
          try {
            const gbkDecoder = new TextDecoder('gbk');
            decodedText = gbkDecoder.decode(bytes);
            encoding = 'GBK';
            console.log('GBK解码结果:', decodedText.substring(0, 200));
          } catch (gbkError) {
            console.log('GBK解码失败，尝试GB2312编码');
            
            // 尝试GB2312编码
            const gb2312Decoder = new TextDecoder('gb2312');
            decodedText = gb2312Decoder.decode(bytes);
            encoding = 'GB2312';
            console.log('GB2312解码结果:', decodedText.substring(0, 200));
          }
        }
        
        console.log(`使用${encoding}编码成功，开始解析CSV...`);
        
        // 使用PapaParse解析CSV文本
        Papa.parse(decodedText, {
          header: true,
          skipEmptyLines: true,
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
              const debugInfo = `CSV调试信息:\n\n使用编码: ${encoding}\n\n原始内容:\n${decodedText.substring(0, 500)}...\n\n解析后的数据:\n${JSON.stringify(csvData.slice(0, 3), null, 2)}`;
              setPromptContent(debugInfo);
              return;
            }
            
            // 存储validShots到状态中
            setValidShots(validShots);
            
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
      } catch (error) {
        console.error('文件读取失败:', error);
        message.error('文件读取失败，请重试');
      }
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
          
           {/* 场景管理 */}
           <Card 
             title={
               <span>
                 <GlobalOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                 场景管理
               </span>
             }
             extra={<Button type="primary" icon={<PlayCircleOutlined />}>全部生成</Button>}
             className="scene-management-card"
           >
             <div className="scene-content-layout">
               {validShots.length > 0 ? (
                 <div className="scenes-list">
                   {validShots.map((scene, index) => {
                     const parsedPrompt = parseScenePrompt(scene);
                     const shotNumber = scene['分镜数'] || scene['分镜'] || scene['序号'] || scene['编号'] || (index + 1);
                     
                     return (
                       <div key={index} className="scene-item">
                         {/* 场景标题 */}
                         <div className="scene-header">
                           <div className="scene-title">场景 {shotNumber}</div>
                           <div className="scene-actions">
                             {editingScene === index ? (
                               <div className="edit-buttons">
                                 <Button size="small" onClick={saveEditing} type="primary">保存</Button>
                                 <Button size="small" onClick={cancelEditing}>取消</Button>
                               </div>
                             ) : (
                               <div className="action-buttons">
                                 <Button size="small" onClick={() => startEditing(index)}>编辑</Button>
                                 <Button type="primary" icon={<PlayCircleOutlined />} size="small">
                                   单个生成
                                 </Button>
                               </div>
                             )}
                           </div>
                         </div>

                         {/* 左右两栏布局 */}
                         <div className="scene-content">
                           {/* 左栏：Image Prompt */}
                           <div className="scene-left-panel">
                             <div className="panel-content">
                               <div className="panel-title">
                                 Image Prompt
                               </div>
                               {editingScene === index ? (
                                 <div className="image-prompt-section">
                                   {/* 编辑模式 */}
                                   <div className="prompt-section">
                                     <div className="field-item">
                                       <TextArea
                                        style={{ height: 300 }}
                                         value={editingContent.subject?.action || ''}
                                         onChange={(e) => updateSubjectContent('action', e.target.value)}
                                         placeholder="输入内容"
                                       />
                                     </div>
                                   </div> 
                                 </div>
                               ) : (
                                 <div className="image-prompt-section">
                                   {/* 显示模式 */}
                                   {parsedPrompt ? (
                                     <>
                                       {/* 主体部分 */}
                                       {parsedPrompt.subject && (
                                         <div className="prompt-section">
                                           {parsedPrompt.subject.characters && (
                                             <div className="field-item">
                                               <div className="field-label">角色:</div>
                                               <div className="field-value">{parsedPrompt.subject.characters}</div>
                                             </div>
                                           )}
                                           {parsedPrompt.subject.expression && (
                                             <div className="field-item">
                                               <div className="field-label">表情:</div>
                                               <div className="field-value">{parsedPrompt.subject.expression}</div>
                                             </div>
                                           )}
                                           {parsedPrompt.subject.action && (
                                             <div className="field-item">
                                               <div className="field-value action-text">{parsedPrompt.subject.action}</div>
                                             </div>
                                           )}
                                         </div>
                                       )}

                                       {/* 环境部分 */}
                                       {parsedPrompt.environment && (
                                         <div className="prompt-section">
                                           <div className="section-title">[环境]</div>
                                           <div className="field-item">
                                             <div className="field-label">场景:</div>
                                             <div className="field-value">{parsedPrompt.environment}</div>
                                           </div>
                                         </div>
                                       )}

                                       {/* 时间部分 */}
                                       {parsedPrompt.time && (
                                         <div className="prompt-section">
                                           <div className="section-title">[时间]</div>
                                           <div className="field-item">
                                             <div className="field-label">时间:</div>
                                             <div className="field-value">{parsedPrompt.time}</div>
                                           </div>
                                         </div>
                                       )}

                                       {/* 天气部分 */}
                                       {parsedPrompt.weather && (
                                         <div className="prompt-section">
                                           <div className="section-title">[天气]</div>
                                           <div className="field-item">
                                             <div className="field-label">天气:</div>
                                             <div className="field-value">{parsedPrompt.weather}</div>
                                           </div>
                                         </div>
                                       )}

                                       {/* 视角部分 */}
                                       {parsedPrompt.perspective && (
                                         <div className="prompt-section">
                                           <div className="section-title">[视角]</div>
                                           <div className="field-item">
                                             <div className="field-label">视角:</div>
                                             <div className="field-value">{parsedPrompt.perspective}</div>
                                           </div>
                                         </div>
                                       )}

                                       {/* 景别部分 */}
                                       {parsedPrompt.shotType && (
                                         <div className="prompt-section">
                                           <div className="section-title">[景别]</div>
                                           <div className="field-item">
                                             <div className="field-label">景别:</div>
                                             <div className="field-value">{parsedPrompt.shotType}</div>
                                           </div>
                                         </div>
                                       )}
                                     </>
                                   ) : (
                                     <div className="no-scene-message">暂无场景数据</div>
                                   )}
                                 </div>
                               )}
                             </div>
                           </div>

                           {/* 右栏：生成的图片 */}
                           <div className="scene-right-panel">
                             <div className="panel-content">
                               {/* <div className="panel-title">生成的图片 (0/1)</div> */}
                               <div className="image-placeholder">
                                 <div className="image-number">{index + 1}</div>
                                 <div className="waiting-text">Waiting...</div>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               ) : (
                 <div className="no-scene-message">暂无场景</div>
               )}
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


