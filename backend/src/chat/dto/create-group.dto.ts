import { IsString, IsArray, IsOptional, ArrayNotEmpty } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  participantIds: string[];

  @IsOptional()
  @IsString()
  avatar?: string;
}
