#ifndef _24_BITMAP_H_
#define _24_BITMAP_H_

#include <iostream>
#include <windows.h>

//Open 24-bit bitmap file
BITMAPFILEHEADER* Open_24bmp(const char* fn);

//Copy 24-bit bitmap file
BITMAPFILEHEADER* Copy_24bmp(BITMAPFILEHEADER* pbfh);

//Create a 24-bit bitmap file (without initializing colors)
BITMAPFILEHEADER* Create_24bmp(int w, int h);

//Save a 24-bit bitmap file
void Save_24bmp(const char* fn, BITMAPFILEHEADER* pbfh);

//Close 24-bit bitmap file
void Close_24bmp(BITMAPFILEHEADER* pbfh);

//Get bitmap width and height
void WH_24bmp(BITMAPFILEHEADER* pbfh, int* w, int* h);

//Color structure
struct _YS
{
	unsigned char b, g, r;
};
//Get color at specified position
_YS* color_24bmp(BITMAPFILEHEADER* pbfh, int x, int y);

#endif