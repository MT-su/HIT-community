import * as React from 'react'
import styled from 'styled-components'
import { Skeleton, Avatar, message, Icon, Input, Button, List } from 'antd'
import { observer } from 'mobx-react'

import { appStore } from '@/stores'
import { to } from '@/libs/fans'
import { newsApiService } from '@/services'
import { RouteComponentProps } from '@/components/RouterView'
import avatar from '@/assets/images/avatar.png'

export interface Props extends RouteComponentProps<{ newsId: string }> {}

export interface State {
  newsData: any
  comment: string
  commentList: any
  like: boolean
  unlike: boolean
  collect: boolean
}

@observer
export default class VQuestionViewAnswer extends React.Component<Props, State> {
  public constructor (props: Props) {
    super(props)
    this.state = {
      newsData: {},
      comment: '',
      commentList: [],
      like: false,
      unlike: false,
      collect: false
    }
  }

  public componentDidMount () {
    this.loadNews()
    this.loadComment()
  }

  private loadNews = async () => {
    const newsId = this.props.match.params.newsId
    const [err, data] = await to(newsApiService.viewNews(newsId))
    if (err) return message.error(err.message)
    this.setState({
      newsData: data,
      like: data.isSelfLike === 1,
      unlike: data.isSelfUnLike === 1,
      collect: data.isSelfCollect === 1
    })
  }

  private onCommentChange = (e: any) => {
    this.setState({
      comment: e.target.value
    })
  }

  private loadComment = async () => {
    const newsId = this.props.match.params.newsId
    const [err, data] = await to(newsApiService.ListNewsComment(1, 999, newsId))
    if (err) return message.error(err.message)
    this.setState({
      commentList: data.records
    })
  }

  private onSubmitComment = async () => {
    const newsId = this.props.match.params.newsId
    const [err] = await to(newsApiService.commentNews(newsId, this.state.comment))
    if (err) return message.error(err.message)
    message.success('提交成功')
    this.loadComment()
  }

  // 用户行为
  private onLikeNews = async () => {
    const newsId = this.props.match.params.newsId
    const [err] = await to(newsApiService.likeNews(newsId))
    if (err) return message.error(err.message)
    message.success('操作成功')
    this.setState({
      like: !this.state.like,
    })
    if(this.state.unlike === true){
      this.setState({
      unlike: !this.state.unlike
    })
    }
  }

  private onUnlikeNews = async () => {
    const newsId = this.props.match.params.newsId
    const [err] = await to(newsApiService.unlikeNews(newsId))
    if (err) return message.error(err.message)
    message.success('操作成功')
    this.setState({
      unlike: !this.state.unlike,
    })
     if(this.state.like === true){
      this.setState({
      like: !this.state.like
    })
  }
  }

  private onCollectNews = async () => {
    const newsId = this.props.match.params.newsId
    const [err] = await to(newsApiService.collectNews(newsId))
    if (err) return message.error(err.message)
    message.success('操作成功')
    this.setState({
      collect: !this.state.collect
    })
  }

  public render () {
    const { comment, newsData, commentList, collect, like, unlike } = this.state
    const TextArea = Input.TextArea

    return (
      <Wrapper>
        {!newsData.newsContent && <Skeleton avatar paragraph={{ rows: 12 }} />}
        {newsData.newsContent && (
          <MainContainer>
            <h3>{newsData.title}</h3>
            <TopCon>
              <TimeCon>
                <p>医信社区 &nbsp; &nbsp; &nbsp;{newsData.createdAt}</p>
              </TimeCon>
            </TopCon>
            <MiddleCon>
              <div
                dangerouslySetInnerHTML={{
                  __html: newsData.newsContent
                }}
              />
            </MiddleCon>
            <BottomCon>
              <Oparation>
                <a href='javascript:void(0);' onClick={this.onLikeNews}>
                  <Icon type='like' style={{ marginRight: 8 }} />{' '}
                  {like ? <span style={{ color: '#5579f3' }}>已支持</span> : <span>支持</span>}
                </a>
              </Oparation>
              <Oparation>
                <a href='javascript:void(0);' onClick={this.onUnlikeNews}>
                  <Icon type='dislike' style={{ marginRight: 8 }} />
                  {unlike ? <span style={{ color: '#5579f3' }}>已反对</span> : <span>反对</span>}
                </a>
              </Oparation>
              <Oparation>
                <a href='javascript:void(0);' onClick={this.onCollectNews}>
                  <Icon type='heart' style={{ marginRight: 8 }} />
                  {collect ? <span style={{ color: '#5579f3' }}>已收藏</span> : <span>收藏</span>}
                </a>
              </Oparation>
              <Oparation>
                <Icon type='eye' style={{ marginRight: 8 }} />
                {newsData.readNum}浏览
              </Oparation>
              <Oparation>
                <Icon type='message' style={{ marginRight: 8 }} />
                {newsData.commentNum}条评论
              </Oparation>
            </BottomCon>
            <CommentContainer>
              <CommentList>
                <List
                  itemLayout='horizontal'
                  dataSource={commentList}
                  renderItem={(item: any) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={item.userHeadSculpture ? item.userHeadSculpture : avatar} />}
                        title={<a href='https://ant.design'>{item.userName}</a>}
                        description={item.commentContent}
                      />
                      <p>{item.createdAt}</p>
                    </List.Item>
                  )}
                />
              </CommentList>
              {appStore.userInfo && (
                <CommentInput>
                  <div style={{ display: 'flex' }}>
                    <Avatar style={{ margin: '10px' }} size={40} src={appStore.userInfo.headSculpture} />
                    <TextArea rows={4} onChange={this.onCommentChange} placeholder='发表你的评论...' value={comment} />
                  </div>
                  <Button type='primary' onClick={this.onSubmitComment} style={{ margin: '20px 0 0 850px' }}>
                    提交评论
                  </Button>
                </CommentInput>
              )}
            </CommentContainer>
          </MainContainer>
        )}
      </Wrapper>
    )
  }
}

const Wrapper = styled.div`
  background: #f7f7f7;
  width: 100%;
`

const MainContainer = styled.div`
  background: white;
  padding: 16px;
  width: 100%;
  h3 {
    text-align: center;
    font-size: 20px;
    font-weight: 600;
    margin: 30px 0px;
  }
`
const TopCon = styled.div`
  width: 100%;
  height: 40px;
  text-align: center;
`

const TimeCon = styled.div`
  line-height: 70px;
  font-size: 14px;
`

const MiddleCon = styled.div`
  width: 100%;
  padding: 20px 20px;
  border-bottom: 2px solid #f7f7f7;
  padding-bottom: 40px;
`

const BottomCon = styled.div`
  font-size: 16px;
  padding: 20px;
  width: 100%;
  margin-top: 20px;
`
const Oparation = styled.div`
  display: inline-block;
  height: 20px;
  margin-left: 30px;
  p {
    display: inline;
  }
  span {
    color: rgba(0, 0, 0, 0.65);
  }
`

const CommentContainer = styled.div`
  width: 100%;
  margin-bottom: 200px;
  margin-top: 20px;
  border-top: 2px solid #f7f7f7;
`

const CommentInput = styled.div``

const CommentList = styled.div`
  width: 100%;
  margin-top: 16px;
  padding: 16px;
`
